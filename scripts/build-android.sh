#!/bin/bash

function bundleApp {
    tput setaf 3; echo "BUNDLING APP..."
    react-native bundle --platform android --dev false --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --sourcemap-output android/app/src/main/assets/index.android.map \
    --assets-dest android/app/src/main/res
}

function generateEnvFile () {
    # This function takes the correct environment variables from either env.debug.ts,
    # env.staging.ts or env.release.ts and puts them in env.ts

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

if [ $1 = 'debug' ]
    then
    generateEnvFile "$1"

    tput setaf 4; echo "COMPILING ANDROID PROJECT FOR DEBUG..."
    cd android

    tput setaf 3; echo "ASSEMBLING APP (APK FILE)..."
    ./gradlew assembleDevDebug

    tput setaf 3; echo "BUNDLING APP (AAB FILE)..."
    ./gradlew bundleDevDebug

    tput setaf 3; echo "Uninstalling app on device..."
    adb uninstall com.nuli.app.wip

    tput setaf 3; echo "Installing app on device..."
    adb install -r app/build/outputs/apk/dev/debug/app-dev-debug.apk
    cd ..
    exit 0
fi

if [ $1 = 'staging' ]; then
    generateEnvFile "$1"

    tput setaf 4; echo "COMPILING ANDROID PROJECT FOR STAGING..."
    bundleApp
    cd android

    tput setaf 3; echo "ASSEMBLING APP (APK FILE)..."
    ./gradlew assembleClientStaging

    tput setaf 3; echo "BUNDLING APP (AAB FILE)..."
    ./gradlew bundleClientStaging

    tput setaf 3; echo "Uninstalling app on device..."
    adb uninstall com.nuli.app.staging

    tput setaf 3; echo "Installing app on device..."
    adb install -r app/build/outputs/apk/client/staging/app-client-staging.apk

    open app/build/outputs/apk/client/staging
    cd ..
    exit 0
fi

if [ $1 = 'release' ]; then
    generateEnvFile "$1"

    tput setaf 4; echo "COMPILING ANDROID PROJECT FOR RELEASE..."
    bundleApp

    # Fix "Duplicate ressources" error for release build
    # https://github.com/facebook/react-native/issues/19239#issuecomment-546425129
    git clean -df android/app/src/main/res/

    cd android

    tput setaf 3; echo "ASSEMBLING APP (APK FILE)..."
    ./gradlew assembleMarketRelease

    tput setaf 3; echo "BUNDLING APP (AAB FILE)..."
    ./gradlew bundleMarketRelease

    tput setaf 3; echo "Uninstalling app on device..."
    adb uninstall com.nuli.app

    tput setaf 3; echo "Installing app on device..."
    adb install -r app/build/outputs/apk/market/release/app-market-release.apk

    open app/build/outputs/apk/market/release
    cd ..
    exit 0
fi

if [ $1 = 'clean' ]; then
    tput setaf 4; echo "CLEANING ANDROID PROJECT..."
    cd android
    ./gradlew --stop
    ./gradlew clean
    rm -rf ~/.gradle/caches/*
    cd ..
    exit 0
fi

echo "Parameter $1 not valid (debug | staging | release | clean accepted)"
exit 0
