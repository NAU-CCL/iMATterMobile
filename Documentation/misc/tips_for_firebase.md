# Tips for Firebase
This will just be a list of useful features on Firebase that I use regularly. I hope that they can be useful for others as well, and by reading this, they won't need to find these features on themselves.

- To add new users go to the firebase console, and do the following:
    - In the top left area of the screen, click the settings icon
    - Then, click users and permissions

    - This will bring you to a screen showing all of the current memebers and their permissions. Once there, click Add member at the top of the list

    - Add their email and their roles, and click 'Add Member' once again to finish.

    - This will allow users to both access the firebase console, but also to update all of the firebase functions, allowing them to run the code itself. 

- To access the nosql database, look on the left tab for build, click, and it will be under the 'Firestore Database'

- To access assets for the app, like profile pictures, look on the left tab for build, it will be under 'Storage'

- Like the two above, logging for firebase functions, and other things related to these cloud functions is under build > functions

- A very usefull feature is the extensions page, which has a lot of inbuilt functions for us.
    - One of these is an image resizer, which is already installed. This can be used to make cron-like jobs to resize images to their correct proportions.