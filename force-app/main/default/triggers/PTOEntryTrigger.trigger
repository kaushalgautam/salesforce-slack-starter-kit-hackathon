trigger PTOEntryTrigger on PTO_Entries__c(before insert, after insert, before update, after update, after delete) {
	new Dispatcher()
		.bind(Dispatcher.Evt.beforeUpdate, new PTOEntryTriggerHandler.PaidLeavesHandler())
		.bind(Dispatcher.Evt.afterUpdate, new PTOEntryTriggerHandler.PaidLeavesHandler())
		.bind(Dispatcher.Evt.afterDelete, new PTOEntryTriggerHandler.PaidLeavesHandler())
		.bind(Dispatcher.Evt.afterInsert, new PTONotificationHandler())
		.bind(Dispatcher.Evt.afterUpdate, new PTONotificationHandler())
		// commenting this method during hackathon since this class is throwing an error
		//.bind(Dispatcher.Evt.afterUpdate, new PTOEntryTrackerService())
		.manage();
}
