#!/bin/bash
# This script is used to publish a codepush update

function readAppName () {
    echo "APP_NAME? [1 (Nuli-iOS)/2 (Nuli-Android)]"
    read response

    if [ "$response" == "1" ]; then
        APP_NAME="Nuli-iOS"
    elif [ "$response" == "2" ]; then
        APP_NAME="Nuli-Android"
    else
        tput setaf 1; echo "APP_NAME \"$response\" is not valid"; tput sgr0; echo
        readAppName # Ask again
    fi
}

function readAppEnv () {
    echo "APP_ENV? [1 (Staging)/2 (Production)]"
    read response

    if [ "$response" == "1" ]; then
        APP_ENV="Staging"
    elif [ "$response" == "2" ]; then
        APP_ENV="Production"
    else
        tput setaf 1; echo "APP_ENV \"$response\" is not valid"; tput sgr0; echo
        readAppEnv # Ask again
    fi
}

function readVersionNumber () {
    echo "VERSION_NUMBER? [X.X.X]"
    read response

    if [[ "$response" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        VERSION_NUMBER=$response
    else
        tput setaf 1; echo "VERSION_NUMBER \"$response\" is not valid"; tput sgr0; echo
        readVersionNumber # Ask again
    fi
}

function generateEnvFile () {
    # This function takes the correct environment variables from either env.debug.ts,
    # env.staging.ts or env.release.ts and puts them in env.ts

    tput setaf 3; echo "GENERATING ENV FILE..."
    echo "$APP_ENV"; tput sgr0; echo

    if [ $APP_ENV = 'Staging' ]; then
        cp env.staging.ts env.ts
    fi

    if [ $APP_ENV = 'Production' ]; then
        cp env.release.ts env.ts
    fi
}

tput setaf 3; echo "!!! YOU ARE ABOUT TO PERFORM A CODEPUSH UPDATE !!!"; tput sgr0; echo

# Read parameters
readAppName; echo
readAppEnv; echo
readVersionNumber; echo

# Generate env file according to APP_ENV
generateEnvFile

echo "TO BE EXECUTED:"
tput setaf 4; echo "\$ appcenter codepush release-react -a meliorence/$APP_NAME -d $APP_ENV -t \"$VERSION_NUMBER\""; tput sgr0; echo

# Execute update
tput setaf 3; read -r -p "Publish update? [y/N] " response; tput sgr0;
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    appcenter codepush release-react -a meliorence/$APP_NAME -d $APP_ENV -t "$VERSION_NUMBER"
    echo "Update performed"
else
    echo "Aborting"
fi

exit 0
