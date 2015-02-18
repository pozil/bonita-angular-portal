bonita-angular-portal
========================
**A custom portal for Bonita BPM built with AngularJS and Bootstrap.**

<img src="screenshots/01.png" alt="Task list view"/>

This portal is secured with Bonita user credentials and embeds Bonita forms for starting cases and executing tasks.

<img src="screenshots/02.png" alt="Bonita form integration view"/>

This project uses ngBonita (a non-official Bonita REST API client for AngularJS):
[ngBonita GitHub project](https://github.com/rodriguelegall/ngBonita)

## Installation
1. Download the project files and remove the screenshots directory.
2. Place the project folder into the webapps folder of the Java application server that hosts the original Bonita Portal.

**Note:** if installing on a different server than Bonita, some specific CORS security settings need to be applied.
