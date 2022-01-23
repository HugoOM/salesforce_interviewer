@isTest
public without sharing class I_Apex_1_Test {
	@IsTest 
	private static void testCapitalizedString() {
		System.assertEquals('Test string', I_Apex_1.capitalize('test string'), 'The provided String wasn\'t properly capitalized');
	}
}