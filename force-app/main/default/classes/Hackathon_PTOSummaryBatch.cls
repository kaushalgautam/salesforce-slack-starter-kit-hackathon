global class Hackathon_PTOSummaryBatch implements Database.Batchable<sObject>, Database.AllowsCallouts {
	global Database.QueryLocator start(Database.BatchableContext bc) {
		String soqlQuery = 'SELECT Id, User__c, Slack_User_ID__c From Slack_Authentication__c';
		return Database.getQueryLocator(soqlQuery);
	}

	global void execute(Database.BatchableContext bc, List<Slack_Authentication__c> scope) {
		for (Slack_Authentication__c sa : scope) {
			if (sa.User__c != null && String.isNotBlank(sa.Slack_User_ID__c)) {
				try {
					SlackMessage response = new SlackMessage();
					response.payload = JSON.serialize(Hackathon_PTO_Summary.getPTOSummariesForUser(sa.User__c));
					response.type = 'summary_ptoShortcut';
					response.userId = sa.Slack_User_ID__c;
					SlackService.postMessages(JSON.serialize(response));
				} catch (Exception e) {
					System.debug('Error-' + e.getMessage());
				}
			}
		}
	}

	global void finish(Database.BatchableContext bc) {
	}
}
