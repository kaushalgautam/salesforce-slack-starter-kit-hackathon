/**
 * @description       :
 * @author            : Kaushal Gautam
 * @group             :
 * @last modified on  : 04-09-2022
 * @last modified by  : Kaushal Gautam
 **/
@RestResource(urlMapping='/PTOSummary/*')
global class Hackathon_PTO_Summary {
	static List<String> invalidProjectPhases = new List<String>{ 'Closed', 'Closeout', 'On Hold' };
	static List<String> validProjectTypes = new List<String>{ 'Time & Materials', 'Fixed Project' };

	static String PTO_SUMMARY_SHORTCUT = 'summary_ptoShortcut';

	@HttpGet
	global static SlackMessage doGet() {
		RestRequest req = RestContext.request;
		String userId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);

		SlackMessage response = new SlackMessage();
		response.payload = JSON.serialize(getPTOSummariesForUser(userId));
		response.type = PTO_SUMMARY_SHORTCUT;
		return response;
	}

	public static List<PTOSummary> getPTOSummariesForUser(String userId) {
		List<PTOSummary> ptoSummaries = new List<PTOSummary>();
		Map<Id, List<Id>> pmIdToProjId = new Map<Id, List<Id>>();

		// get projects where user is a member
		Map<Id, Project__c> projectMap = getRelevantProjectMapForUser(userId);
		System.debug('projectMap: ' + projectMap);

		// get all project memebers that are relevant - exculding where members are the main user
		pmIdToProjId = getRelevantProjectMembersForProjects(userId, projectMap.keySet());
		System.debug('pmIdToProjId: ' + pmIdToProjId);

		// get approved ptos of all members that are relevant
		for (PTO_Entries__c pto : [
			SELECT ID, OwnerId, Owner.Name, Start_Date__c, End_Date__c, No_of_PTO_Days__c
			FROM PTO_Entries__c
			WHERE OwnerId IN :pmIdToProjId.keySet() AND Status__c = 'Approved' AND Start_Date__c < NEXT_MONTH AND Start_Date__c >= TODAY
		]) {
			for (Id projectId : pmIdToProjId.get(pto.OwnerId)) {
				PTOSummary newSummary = new PTOSummary();
				newSummary.ProjectId = projectId;
				newSummary.ProjectName = projectMap.get(projectId).Name;
				newSummary.PTOEntry = pto;
				ptoSummaries.add(newSummary);
			}
		}

		//System.debug('pmList: ' + pmList);
		return ptoSummaries;
	}

	public static Map<Id, Project__c> getRelevantProjectMapForUser(String userId) {
		Map<Id, Project__c> projectMap = new Map<Id, Project__c>();
		for (Project_Member__c pm : [
			SELECT Id, Member__r.Name, Project__c, Project__r.Name, Member__c
			FROM Project_Member__c
			WHERE Member__c = :userId AND Project__r.Phase__c NOT IN :invalidProjectPhases AND Project__r.Type__c IN :validProjectTypes
		]) {
			Project__c tempProj = new Project__c();
			tempProj.Id = pm.Project__c;
			tempProj.Name = pm.Project__r.Name;

			if (!projectMap.containsKey(pm.Project__c)) {
				projectMap.put(pm.Project__c, tempProj);
			}
		}

		return projectMap;
	}

	public static Map<Id, List<Id>> getRelevantProjectMembersForProjects(String userId, Set<Id> projectIds) {
		Map<Id, List<Id>> pmIdToProjId = new Map<Id, List<Id>>();
		for (Project_Member__c pm : [
			SELECT Id, Member__r.Name, Project__c, Project__r.Name, Member__c
			FROM Project_Member__c
			WHERE
				Project__c IN :projectIds
				AND Member__c != NULL
				AND Member__c != :userId
				AND Project__r.Phase__c NOT IN :invalidProjectPhases
				AND Project__r.Type__c IN :validProjectTypes
		]) {
			if (!pmIdToProjId.containsKey(pm.Member__c)) {
				pmIdToProjId.put(pm.Member__c, new List<Id>());
			}
			List<Id> tempProjIdList = pmIdToProjId.get(pm.Member__c);
			tempProjIdList.add(pm.Project__c);
			pmIdToProjId.put(pm.Member__c, tempProjIdList);
		}

		return pmIdToProjId;
	}

	global class PTOSummary {
		global string ProjectName;
		global string ProjectId;
		global PTO_Entries__c PTOEntry;
	}
}
