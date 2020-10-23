#!/bin/bash

# This script is automatically called by the build phase "Generating .env" is Xcode

function generateEnvFile () {
    # This function takes the correct environment variables from either env.debug.ts,
    # env.staging.ts or env.release.ts and puts them in env.ts

    cd ..

    tput setaf 3; echo "GENERATING ENV FILE..."
    echo "$1"

    if [ $1 = 'debug' ]; then
        cp env.debug.ts env.ts
    fi

    if [ $1 = 'staging' ]; then
        cp env.staging.ts env.ts
    fi

    if [ $1 = 'release' ]; then
        cp env.release.ts env.ts
    fi
}

if [ $1 = 'debug' ]; then
    generateEnvFile "$1"
    exit 0
fi

if [ $1 = 'staging' ]; then
    generateEnvFile "$1"
    exit 0
fi

if [ $1 = 'release' ]; then
    generateEnvFile "$1"
    exit 0
fi

echo "Parameter $1 not valid (debug | staging | releas accepted)"
exit 0
