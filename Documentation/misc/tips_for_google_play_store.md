# Tips for Google Play Store Console
This will have various tips for managing iMATter or other apps on the google play store console. It's mostly well laid out, but there are some confusing parts of the project. 

- Uploading a new version of the app: 
    - First, decide which track this should be a part of:
        - Production: For a very stable build to be released to as many people as possible
        - Open Testing: Anybody with a link to the play store page can download this new version
        - Closed Testing: As many people as we allow into the test, who have the link, can download this new version
        - Internal Testing: A limited number of poeple with the link, can download this new version

    - On the top right of the screen and click on the 'Create New Release' or 'Edit Release' button 
    
    - Click upload in the center of the screen, and upload the new '.aab' file and ensure that there are no errors 

    - Scroll to the bottom of the page, and write a new Release name if desired (otherwise it will just be named the same as the version number)
    
    - Likewise, write the release notes for the app, this will be prepended to the app description for users. It is common to put version changes in this box.

    - Click next 

    - Make sure that the new release is submitted for review. This is different for different releases. As an example, the internal testing does not need to be reviewed. 

    - The app has now been released! 

- When submitting a new version of the app, make sure the app gets submitted for review. 
