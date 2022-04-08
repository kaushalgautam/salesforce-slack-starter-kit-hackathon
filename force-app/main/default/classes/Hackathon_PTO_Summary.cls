@RestResource(urlMapping='/PTOSummary/*')
global class Hackathon_PTO_Summary {
  static List<String> invalidProjectPhases = new List<String>{
    'Closed',
    'Closeout',
    'On Hold'
  };
  static List<String> validProjectTypes = new List<String>{
    'Time & Materials',
    'Fixed Project'
  };

  @HttpGet
  global static List<PTOSummary> doGet() {
    RestRequest req = RestContext.request;
    String userId = req.requestURI.substring(
      req.requestURI.lastIndexOf('/') + 1
    );

    Map<Id, Project__c> projectMap = new Map<Id, Project__c>();
    Map<Id, List<Id>> pmIdToProjId = new Map<Id, List<Id>>();
    List<PTOSummary> ptoSummaries = new List<PTOSummary>();

    // get projects where user is a member
    // projectmember id to project id store somewhere
    for (Project_Member__c pm : [
      SELECT Id, Member__r.Name, Project__c, Project__r.Name, Member__c
      FROM Project_Member__c
      WHERE
        Member__c = :userId
        AND Project__r.Phase__c NOT IN :invalidProjectPhases
        AND Project__r.Type__c IN :validProjectTypes
    ]) {
      Project__c tempProj = new Project__c();
      tempProj.Id = pm.Project__c;
      tempProj.Name = pm.Project__r.Name;

      if (!projectMap.containsKey(pm.Project__c)) {
        projectMap.put(pm.Project__c, tempProj);
      }
    }
    System.debug('projectMap: ' + projectMap);

    // get all project memebers that are relevant
    for (Project_Member__c pm : [
      SELECT Id, Member__r.Name, Project__c, Project__r.Name, Member__c
      FROM Project_Member__c
      WHERE
        Project__c IN :projectMap.keySet()
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
    System.debug('pmIdToProjId: ' + pmIdToProjId);

    // get approved ptos of all members that are relevant
    for (PTO_Entries__c pto : [
      SELECT
        ID,
        OwnerId,
        Owner.Name,
        Start_Date__c,
        End_Date__c,
        No_of_PTO_Days__c
      FROM PTO_Entries__c
      WHERE
        OwnerId IN :pmIdToProjId.keySet()
        AND Status__c = 'Approved'
        AND Start_Date__c < NEXT_MONTH
        AND Start_Date__c >= TODAY
    ]) {
      for (Id projectId : pmIdToProjId.get(pto.OwnerId)) {
        PTOSummary newSummary = new PTOSummary();
        newSummary.ProjectId = projectId;
        newSummary.ProjectName = projectMap.get(projectId).Name;
        newSummary.PTOEntry = pto;
        ptoSummaries.add(newSummary);
      }
    }

    System.debug('ptoSummaries: ' + ptoSummaries);

    //System.debug('pmList: ' + pmList);
    return ptoSummaries;
  }

  private static string getActiveProjectMembersList(String userId) {
    return '';
  }

  global class PTOSummary {
    global string ProjectName;
    global string ProjectId;
    global PTO_Entries__c PTOEntry;
  }
}
