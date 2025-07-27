Step 1 - build frontend using
 - npm run build

Step 2 - Copy and sync generated fe with android
 - npx cap copy && npx cap sync

Step 3 - build for android
  cd android ./gradlew assembleDebug