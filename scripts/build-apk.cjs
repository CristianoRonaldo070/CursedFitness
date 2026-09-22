const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, cwd = ROOT, env = process.env) {
  console.log(`\n> ${cmd} (in ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

async function main() {
  console.log('=== Step 1: Generating Android Launcher Icons & Splash Screens ===');
  require('./generate-android-icons.cjs');

  console.log('\n=== Step 2: Building Mobile Client SPA Bundle ===');
  run('npx vite build --config vite.mobile.config.ts');

  // Rename index-mobile.html to index.html if necessary
  const outIndex = path.join(ROOT, 'capacitor-app', 'index-mobile.html');
  const targetIndex = path.join(ROOT, 'capacitor-app', 'index.html');
  if (fs.existsSync(outIndex)) {
    if (fs.existsSync(targetIndex)) fs.unlinkSync(targetIndex);
    fs.renameSync(outIndex, targetIndex);
    console.log('Renamed index-mobile.html -> index.html');
  }

  // Copy favicon.svg & body.png to capacitor-app
  const favSrc = path.join(ROOT, 'public', 'favicon.svg');
  const favDest = path.join(ROOT, 'capacitor-app', 'favicon.svg');
  if (fs.existsSync(favSrc)) fs.copyFileSync(favSrc, favDest);

  const bodySrc = path.join(ROOT, 'public', 'body.png');
  const bodyDest = path.join(ROOT, 'capacitor-app', 'body.png');
  if (fs.existsSync(bodySrc)) fs.copyFileSync(bodySrc, bodyDest);

  console.log('\n=== Step 3: Syncing Assets to Capacitor Android ===');
  run('npx cap sync android');

  console.log('\n=== Step 4: Compiling Native Android APK with Gradle ===');
  const gradleEnv = {
    ...process.env,
    JAVA_HOME: 'C:\\Program Files\\Java\\jdk-21.0.10',
    ANDROID_HOME: 'C:\\Users\\pawar\\AppData\\Local\\Android\\Sdk',
  };

  const androidDir = path.join(ROOT, 'android');
  run('.\\gradlew.bat clean assembleDebug', androidDir, gradleEnv);

  console.log('\n=== Step 5: Updating Website Downloadable APK ===');
  const builtApk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const publicApk = path.join(ROOT, 'public', 'cursed-fitness.apk');

  if (fs.existsSync(builtApk)) {
    fs.copyFileSync(builtApk, publicApk);
    const stat = fs.statSync(publicApk);
    const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    console.log(`SUCCESS! Copied fresh APK to public/cursed-fitness.apk (${sizeMb} MB)`);
  } else {
    throw new Error(`Built APK not found at ${builtApk}`);
  }

  console.log('\n=== ALL DONE! The mobile APK is built, verified, and ready! ===\n');
}

main().catch(err => {
  console.error('\nBuild failed:', err);
  process.exit(1);
});
