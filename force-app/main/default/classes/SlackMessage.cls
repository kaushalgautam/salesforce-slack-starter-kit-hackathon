/**
 * @description       :
 * @author            : Kaushal Gautam
 * @group             :
 * @last modified on  : 04-10-2022
 * @last modified by  : Kaushal Gautam
 **/
public with sharing class SlackMessage {
	public PTONotificationHandler.PTO_Entry pto;
	public Project_Member__c pm;
	public String instanceUrl;
	public String userId;
}
