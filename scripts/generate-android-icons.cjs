const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'public', 'favicon.svg');
const RES_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

async function generate() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Densities for launcher icons
  const launcherSizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  const foregroundSizes = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
  };

  console.log('Generating launcher icons from favicon.svg...');

  for (const [dir, size] of Object.entries(launcherSizes)) {
    const targetDir = path.join(RES_DIR, dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Regular launcher icon
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 7, g: 17, b: 30, alpha: 1 } })
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round launcher icon
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );
    const squareBuffer = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 7, g: 17, b: 30, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp(squareBuffer)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    console.log(`Generated ${dir}/ic_launcher.png and ic_launcher_round.png (${size}x${size})`);
  }

  // 3. Foreground icons (108x108 viewport proportional)
  for (const [dir, size] of Object.entries(foregroundSizes)) {
    const targetDir = path.join(RES_DIR, dir);
    const iconSize = Math.round(size * 0.65);
    const padding = Math.round((size - iconSize) / 2);

    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: iconBuffer, top: padding, left: padding }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated ${dir}/ic_launcher_foreground.png (${size}x${size})`);
  }

  // 4. Splash screens
  const splashConfigs = [
    { dir: 'drawable', w: 480, h: 800 },
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  ];

  for (const conf of splashConfigs) {
    const targetDir = path.join(RES_DIR, conf.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const iconDim = Math.round(Math.min(conf.w, conf.h) * 0.35);
    const iconBuf = await sharp(svgBuffer)
      .resize(iconDim, iconDim, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const top = Math.round((conf.h - iconDim) / 2);
    const left = Math.round((conf.w - iconDim) / 2);

    await sharp({
      create: {
        width: conf.w,
        height: conf.h,
        channels: 4,
        background: { r: 7, g: 17, b: 30, alpha: 1 } // #07111e
      }
    })
      .composite([{ input: iconBuf, top, left }])
      .png()
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Generated ${conf.dir}/splash.png (${conf.w}x${conf.h})`);
  }

  console.log('All icons & splash screens generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
