/**
 * @description       :
 * @author            : Kaushal Gautam
 * @group             :
 * @last modified on  : 04-10-2022
 * @last modified by  : Kaushal Gautam
 **/

public without sharing class PTONotificationHandler implements Dispatcher.Handler {
	public void handle() {
		Map<Id, PTO_Entries__c> relevantPTOEntries = new Map<Id, PTO_Entries__c>();
		Map<Id, PTO_Entries__c> userToPTOEntriesMap = new Map<Id, PTO_Entries__c>();
		List<SlackMessage> messages = new List<SlackMessage>();

		for (Id ptoId : Trigger.newMap.keySet()) {
			if (
				(Trigger.isInsert &&
				(((PTO_Entries__c) Trigger.newMap.get(ptoId)).Start_Date__c.toStartofWeek() == Date.today().toStartOfWeek()) &&
				((PTO_Entries__c) Trigger.newMap.get(ptoId)).Status__c == 'Approved') ||
				(Trigger.isUpdate &&
				(((PTO_Entries__c) Trigger.newMap.get(ptoId)).Start_Date__c.toStartofWeek() == Date.today().toStartOfWeek()) &&
				(((PTO_Entries__c) Trigger.newMap.get(ptoId)).Status__c == 'Approved' &&
				(((PTO_Entries__c) Trigger.oldMap.get(ptoId)).Status__c != 'Approved')))
			) {
				System.debug('Record Matched: ' + Trigger.newMap.get(ptoId));
				relevantPTOEntries.put(ptoId, (PTO_Entries__c) Trigger.newMap.get(ptoId));
			}
		}

		if (relevantPTOEntries.isEmpty()) {
			return;
		}

		for (PTO_Entries__c pto : [
			SELECT ID, Owner.Name, Start_Date__c, End_Date__c, No_of_PTO_Days__c
			FROM PTO_Entries__c
			WHERE ID IN :relevantPTOEntries.keySet() AND Start_Date__c >= TODAY
		]) {
			userToPTOEntriesMap.put(pto.OwnerId, pto);
		}

		// get project members details via user id
		Map<Id, List<Project_Member__c>> userIdToPMMap = new Map<Id, List<Project_Member__c>>();
		userIdToPMMap = getUserIdToProjectMembersMap(new List<Id>(userToPTOEntriesMap.keySet()));

		// userId > slack Id
		Map<Id, String> slackUserIdsBySalesforceUserId = preloadUserMappings();

		// if project members exist in the Slack_Authentication__c exist, then we create messages
		for (Id userId : userIdToPMMap.keySet()) {
			for (Project_Member__c pm : userIdToPMMap.get(userId)) {
				if (slackUserIdsBySalesforceUserId.containsKey(pm.Member__c)) {
					PTO_Entries__c pto = userToPTOEntriesMap.get(userId);
					String slackUserId = slackUserIdsBySalesforceUserId.get(pm.Member__c);
					SlackMessage message = createMessage(slackUserId, pto, pm);
					messages.add(message);
				}
			}
		}
		System.debug(messages);

		if (messages.size() > 0) {
			SlackService.postMessages(JSON.serialize(messages));
		}
	}

	private static Map<Id, List<Project_Member__c>> getUserIdToProjectMembersMap(List<Id> userIds) {
		List<String> invalidProjectPhases = new List<String>{ 'Closed', 'Closeout', 'On Hold' };
		List<String> validProjectTypes = new List<String>{ 'Time & Materials', 'Fixed Project' };

		Map<Id, List<Id>> userIdToProjects = new Map<Id, List<Id>>();
		Map<Id, List<Id>> projectIdToUserIds = new Map<Id, List<Id>>();

		Map<Id, List<Project_Member__c>> userToPmMap = new Map<Id, List<Project_Member__c>>();
		Set<Id> projectIdSet = new Set<Id>();

		for (Project_Member__c pm : [
			SELECT Id, Project__c, Member__c
			FROM Project_Member__c
			WHERE Member__c IN :userIds AND Project__r.Phase__c NOT IN :invalidProjectPhases AND Project__r.Type__c IN :validProjectTypes
		]) {
			if (!projectIdToUserIds.containsKey(pm.Project__c)) {
				projectIdToUserIds.put(pm.Project__c, new List<Id>());
			}
			List<Id> tmpList = projectIdToUserIds.get(pm.Project__c);
			tmpList.add(pm.Member__c);
			projectIdToUserIds.put(pm.Project__c, tmpList);
		}

		for (Project__c proj : [
			SELECT
				Id,
				Name,
				(
					SELECT Id, Name, Member__r.Name, Member__c, Project__c, Project__r.Name
					FROM Project_Members__r
					WHERE Member__c NOT IN :userIds AND Member__c != NULL
				)
			FROM Project__c
			WHERE
				Id IN (SELECT Project__c FROM Project_Member__c WHERE Member__c IN :userIds)
				AND Phase__c NOT IN :invalidProjectPhases
				AND Type__c IN :validProjectTypes
		]) {
			for (Project_Member__c pm : proj.Project_Members__r) {
				List<Id> userIdsForProject = projectIdToUserIds.get(pm.Project__c);
				for (Id userId : userIdsForProject) {
					if (!userToPmMap.containsKey(userId)) {
						userToPmMap.put(userId, new List<Project_Member__c>());
					}
					List<Project_Member__c> tmpList = userToPmMap.get(userId);
					tmpList.add(pm);
					userToPmMap.put(userId, tmpList);
				}
			}
		}

		return userToPmMap;
	}

	private static Map<Id, String> preloadUserMappings() {
		Map<Id, String> slackUserIdsBySalesforceUserId = new Map<Id, String>();

		for (Slack_Authentication__c userMapping : [SELECT Slack_User_ID__c, User__c FROM Slack_Authentication__c]) {
			slackUserIdsBySalesforceUserId.put(userMapping.User__c, userMapping.Slack_User_ID__c);
		}
		return slackUserIdsBySalesforceUserId;
	}

	private static SlackMessage createMessage(String slackUserId, PTO_Entries__c pto, Project_Member__c pm) {
		NotificationMessage message;
		if (slackUserId != null) {
			// create message if user authenticated from slack
			message = new NotificationMessage();
			message.pto = getPTOEntryWrapper(pto);
			message.pm = pm;
			message.userId = slackUserId;
			message.instanceUrl = URL.getSalesforceBaseUrl().toExternalForm();
			System.debug(
				'Hi ' +
				slackUserId +
				', user ' +
				pto.Owner.Name +
				' on proj ' +
				pm.Project__r.Name +
				' OOO from ' +
				pto.Start_Date__c +
				' for ' +
				pto.No_of_PTO_Days__c +
				' day(s) '
			);
		}

		SlackMessage slackMessage = new SlackMessage();
		slackMessage.payload = JSON.serialize(message);
		slackMessage.type = 'notification_immediatePto';

		return slackMessage;
	}

	private static PTO_Entry getPTOEntryWrapper(PTO_Entries__c pto) {
		PTO_Entry ptoWrapper = new PTO_Entry();
		ptoWrapper.OwnerName = pto.Owner.Name;
		ptoWrapper.Start_Date = pto.Start_Date__c;
		ptoWrapper.End_Date = pto.End_Date__c;
		ptoWrapper.No_of_PTO_Days = Integer.valueOf(pto.No_of_PTO_Days__c);

		return ptoWrapper;
	}

	// custom class to represent pto entries since we don't need decimals
	public class PTO_Entry {
		public string OwnerName;
		public date Start_Date;
		public date End_Date;
		public Integer No_of_PTO_Days;
	}

	public class NotificationMessage {
		public PTONotificationHandler.PTO_Entry pto;
		public Project_Member__c pm;
		public String instanceUrl;
		public String userId;
	}
}
