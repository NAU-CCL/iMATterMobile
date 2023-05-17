## Creating The Environment to Develop iMATter

1. Create a directory for iMATterMobile and iMATterWeb
	* e.g. Desktop/iMATter/iMATterMobile
	* cd into the directory 

 <br />   
 
2. Copy the github repository link and clone in your directory for both mobile and web app
	* ``` $ git clone https://github.com/... ```
	* now you have all the iMATtermobile data!   

 <br />   
 

3. Installing Node.js
	* For mac, install with homebrew in terminal:  
	``` $ brew install node@16.20.0 ```  
	(version number may be different) 
	* For windows, go to [node.js previous node releases](https://nodejs.org/en/download/releases), select 'releases' and select one of the .msi files

 <br />   
 

4. Check that the correct node and npm versions are installed
	* ``` $ node -v ```  and  ``` $ npm -v ``` 
	* As of May 2023, it should be node v16.20.0 and npm v8.19.4

 <br />   
 
5. Install Cordova in your terminal
	* ``` $ npm install -g cordova ```

 <br />   
 
6. Install ionic in your terminal
	* ``` $ npm install -g ionic ```

 <br />   

7. Install the project dependencies
	* go to the mobile and web app directories respectively
	* in both, run the command ``` $ npm install ``` 
 
 <br />   

 ### Now lets see if we can run the app!

 In your terminal try ``` $ ionic serve ```, 
 * if everything is working, it should take you to a browser with localhost:8100 and show the iMATtermobile.
 * To see the app as you would on a phone, you should inspect the page and turn it into a mobile platform

 <br />   

### Not done just yet, lets get access to firebase tools and database

1. Run command in terminal ``` $ npm i -g  firebase-tools@11.14.2  firebase@9.11.0 ```

2. Afterwards, do ``` $ firebase login ```

3. Then, ``` $ firebase init ```, this should pull up a menu where you want to choose the 'Hosting' option

 <br />   

### Download android tools for the app

1. Create a directory 'android'
2. Download the command line tools from the android website
3. Move the 'cmdline_tools' directory from downloads into the android directory, cd into it
5. Create a directory called 'latest'
6. Go back to the android directory and move files into 'latest' ``` $ mv lib bin NOTICE.txt source.properties latest ```
7. Then, run the commands: 
	* ```$ cmdline-tools/latest/bin/sdkmanager "build-tools;33.0.0" ``` (33.0.0)
	* ```$ cmdline-tools/latest/bin/sdkmanager "build-tools;32.0.1" ``` (33.0.1)
	* ```$ cmdline-tools/latest/bin/sdkmanager "platforms;android-32" ``` (32)
	* ```$ cmdline-tools/latest/bin/sdkmanager "platforms;android-33" ``` (33)

 <br />   

8. Afterwards, return to your root directory and go into the .bashrc (or .zshrc for mac) and paste the following:

 <br /> 

	# Android SDK env variables
	export ANDROID_HOME=$HOME/android
	export PATH=$ANDROID_HOME/cmdline-tools/latest/bin/:$PATH
	export PATH=$ANDROID_HOME/emulator/:$PATH
	export PATH=$ANDROID_HOME/platform-tools/:$PATH

	# Load Angular CLI autocompletion.
	source <(ng completion script)

## All done! Now try ``` $ ionic serve ``` to make sure that everything is running!


