---
exercise_directory: apex-methods-beginner
apex_class_api_name: I_Apex_1
version: 1
level: junior
tests:
    - |
      @isTest private static void testCapitalizedString() {
        System.assertEquals('Test string', One.capitalize('test string'), 'The provided String wasn\'t properly capitalized');
      }
---

# Apex

Implement a __capitalize__ method with the following signature, which will satisfy the following test

```java
public static String capitalize(String inputString) {
	// ... Input: 'test string' Expected: 'Test string'
}
```