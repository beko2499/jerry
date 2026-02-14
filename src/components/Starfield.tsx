import { useEffect, useRef } from 'react';

interface StarfieldProps {
  speed?: number;
  backgroundColor?: string;
  starColor?: string;
  starCount?: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
}

interface Planet {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  type: 'gas' | 'rocky' | 'ice';
}

interface Comet {
  x: number;
  y: number;
  z: number;
  speed: number;
  angle: number;
  length: number;
  active: boolean;
}

interface SocialPacket {
  x: number;
  y: number;
  z: number;
  iconIndex: number;
  rotation: number;
  rotSpeed: number;
  baseSize: number;
}

// SVG Data URIs for Social Icons (White/Color)
const SOCIAL_ICONS = [
  // TikTok (Cyan/Pink Split effect color manually or just white/black? Let's use the brand colors or white for space theme)
  // Using White for consistent space theme, maybe with a glow.
  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIiBmaWxsPSIjRkZGIj48IS0tITtGb250QXdlc29tZSBGcmVlIDYuNS4xIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlL2ZyZWUgQ29weXJpZ2h0IDIwMjQgRm9udGljb25zLCBJbmMuLS0+PHBhdGggZD0iTTQ0OCwyMDkuOTFhMjEwLjA2LDIxMC4wNiwwLDAsMS0xMjIuNzctMzkuMjVWMzQ5LjM4QTE2Mi41NSwxNjIuNTUsMCwxLDEsMTg1LDE4OC4zMVYyNzguMmE5MC4yNSw5MC4yNSwwLDEsMCw0My43LDc3Ljc5VjgzbDg3LjA4djQuM2ExMjMuMDksMTIzLjA5LDAsMCwwLDEzMi4yMiwxMjIuNjFaIi8+PC9zdmc+`,
  // Instagram
  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIiBmaWxsPSIjRkZGIj48cGF0aCBkPSJNMjI0LjEgMTQxYy02My42IDAtMTE0LjkgNTEuMy0xMTQuOSAxMTQuOXM1MS4zIDExNC45IDExNC45IDExNC45UzMzOSAzMTkuNSAzMzkgMjU1LjkgMjg3LjcgMTQxIDIyNC4xIDE0MXptMCAxODkuNmMtNDEuMSAwLTc0LjctMzMuNS03NC43LTc0LjdzMzMuNS03NC43IDc0LjctNzQuNyA3NC43IDMzLjUgNzQuNyA3NC43LTMzLjUgNzQuNy03NC43IDc0Ljd6bTE0Ni40LTE5NC4zYzAgMTQuOS0xMiAyNi44LTI2LjggMjYuOC0xNC45IDAtMjYuOC0xMi0yNi44LTI2LjhzMTItMjYuOCAyNi44LTI2LjggMjYuOCAxMiAyNi44IDI2Ljh6bTc2LjEgMjcuMmMtMS43LTM1LjktOS45LTY3LjctMzYuMi05My45LTI2LjItMjYuMi01OC0zNC40LTkzLjktMzYuMi0zNy0yLjEtMTQ3LjktMi4xLTE4NC45IDAtMzUuOCAxLjctNjcuNiA5LjktOTMuOSAzNi4xcy0zNC40IDU4LTM2LjIgOTMuOS1jLTIuMSAzNy0yLjEgMTQ3LjkgMCAxODQuOSAxLjcgMzUuOSA5LjkgNjcuNyAzNi4yIDkzLjlzNTggMzQuNCA5My45IDM2LjJjMzcgMi4xIDE0Ny45IDIuMSAxODQuOSAwIDM1LjktMS43IDY3LjctOS45IDkzLjktMzYuMiAyNi4yLTI2LjIgMzQuNC01OCAzNi4yLTkzLjkgMi4xLTM3IDIuMS0xNDcuOSAwLTE4NC45ek0zOTguOCAzODhjLTcuOCAxOS42LTIyLjkgMzQuNy00Mi42IDQyLjYtMjkuNSAxMS43LTk5LjUgOS0xMzIuMSA5cy0xMDIuNyAyLjYtMTMyLjEtOWMtMTkuNi03LjgtMzQuNy0yMi45LTQyLjYtNDIuNi0xMS43LTI5LjUtOS05OS41LTktMTMyLjFzLTIuNi0xMDIuNyA5LTEzMi4xYzcuOC0xOS42IDIyLjktMzQuNyA0Mi42LTQyLjYgMjkuNS0xMS43IDk5LjUgOSAxMzIuMSA5czEwMi43LTIuNiAxMzIuMSA5YzE5LjYgNy44IDM0LjcgMjIuOSA0Mi42IDQyLjYgMTEuNyAyOS41IDkgOTkuNSA5IDEzMi4xczIuNyAxMDIuNy05IDEzMi4xeiIvPjwvc3ZnPg==`,
  // Facebook
  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjRkZGIj48cGF0aCBkPSJNNTA0IDI1NkM1MDQgMTE5IDM5MyA4IDI1NiA4UzggMTE5IDggMjU2YzAgMTIzLjc4IDkwLjY5IDIyNi4zOCAyMDkuMjUgMjQ1VjMyNy42OWgtNjNWMjU2aDYzdi01NC42NGMwLTYyLjE1IDM3LTk2LjQ4IDkzLjY3LTk2LjQ4IDI3LjE0IDAgNTUuNTIgNC44NCA1NS41MiA0Ljg0djYxaC0zMS4yOGMtMzAuOCAwLTQwLjQxIDE5LjEyLTQwLjQxIDM4LjczVjI1Nmg2OC43OGwtMTEgNzEuNjloLTU3Ljc4VjUwMUM0MTMuMzEgNDgyLjM4IDUwNCAzNzkuNzggNTA0IDI1NnoiLz48L3N2Zz4=`,
  // Telegram
  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OTYgNTEyIiBmaWxsPSIjRkZGIj48cGF0aCBkPSJNMjQ4IDhDMTExIDggMCAxMTkgMCAyNTZzMTExIDI0OCAyNDggMjQ4IDI0OC0xMTEgMjQ4LTI0OFMzODUgOCAyNDggOHptMTIxLjggMTY5LjlsLTQwLjc2IDE5MS44Yy0zIDEzLjYtMTEuMSAxNi45LTIyLjQgMTAuNWwtNjItNDUuNy0yOS45IDI4LjhjLTMuMyAzLjMtNi4xIDYuMS0xMi41IDYuMWw0LjQtNjMuMSAxMTQuOS0xMDMuOGM1LTQuNC0xLjEtNi45LTcuNy0yLjVsLTE0MiA4OS40LTYxLjItMTkuMWMtMTMuMy00LjItMTMuNi0xMy4zIDIuOC0xOS43bDIzOS4xLTkyLjJjMTEuMS00IDIwLjggMi43IDE3LjIgMTk1eiIvPjwvc3ZnPg==`,
  // Twitter / X
  `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjRkZGIj48cGF0aCBkPSJNMzg5LjIgNDhoNzAuNkwzMDUuNiAyMjQuMiA0ODcgNDY0SDM0NUwyMzMuNyAzMTguNiAxMDYuNSA0NjRIMzUuOEwyMDAuNyAyNzUuNSAyNi44IDQ4SDE3Mi40TDI3Mi45IDE4MC45IDM4OS4yIDQ4ek0zNjQuNCA0MjEuOGgzOS4xTDE1MS4xIDg4aC00MkwzNjQuNCA0MjEuOHoiLz48L3N2Zz4=`,
];

export default function Starfield({
  speed = 0.05,
  backgroundColor = 'black',
  starColor = 'white',
  starCount = 1000,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socialImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // Preload images
    if (socialImagesRef.current.length === 0) {
      SOCIAL_ICONS.forEach((src) => {
        const img = new Image();
        img.src = src;
        socialImagesRef.current.push(img);
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let planets: Planet[] = [];
    let comets: Comet[] = [];
    let socialPackets: SocialPacket[] = [];

    // Fixed depth constant to ensure consistent speed across devices
    const Z_DEPTH = 2000;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const planetColors = [
      '#ff4d4d', // Red
      '#4da6ff', // Blue
      '#ffcc80', // Orange-ish
      '#a380ff', // Purple
      '#66ffcc', // Teal
    ];

    const spawnSocialPacket = () => {
      // Logic: Spawn appearing to come from background, possibly near a planet's screen coords?
      // For simplicity in 3D: just spawn at same 3D coords as a random planet (if active) or random 3D back

      let startX = (Math.random() - 0.5) * canvas.width * 2;
      let startY = (Math.random() - 0.5) * canvas.height * 2;

      // 30% chance to spawn exactly at a planet's current XY trajectory
      if (planets.length > 0 && Math.random() < 0.3) {
        const planet = planets[Math.floor(Math.random() * planets.length)];
        startX = planet.x;
        startY = planet.y;
      }

      socialPackets.push({
        x: startX,
        y: startY,
        z: Z_DEPTH,
        iconIndex: Math.floor(Math.random() * SOCIAL_ICONS.length),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        baseSize: 30 + Math.random() * 20
      });
    };

    const initObjects = () => {
      stars = [];
      planets = [];
      comets = [];
      socialPackets = [];

      // Stars
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width * 2, // Wider spread
          y: (Math.random() - 0.5) * canvas.height * 2,
          z: Math.random() * Z_DEPTH,
        });
      }

      // Planets (fewer, larger)
      for (let i = 0; i < 5; i++) {
        planets.push({
          x: (Math.random() - 0.5) * canvas.width * 2,
          y: (Math.random() - 0.5) * canvas.height * 2,
          z: Math.random() * Z_DEPTH,
          radius: Math.random() * 20 + 10,
          color: planetColors[Math.floor(Math.random() * planetColors.length)],
          type: 'gas',
        });
      }

      // Comets (initialize inactive pool)
      for (let i = 0; i < 3; i++) {
        comets.push({
          x: 0,
          y: 0,
          z: 0,
          speed: 0,
          angle: 0,
          length: 0,
          active: false,
        });
      }

      // Initial social packets
      for (let i = 0; i < 3; i++) spawnSocialPacket();
    };

    const spawnComet = (comet: Comet) => {
      comet.active = true;
      comet.z = Math.random() * Z_DEPTH * 0.5; // Closer
      // Start from outside screen
      const side = Math.floor(Math.random() * 4);
      const buffer = 100;

      if (side === 0) { // Top
        comet.x = Math.random() * canvas.width - canvas.width / 2;
        comet.y = -canvas.height / 2 - buffer;
        comet.angle = Math.PI / 2 + (Math.random() - 0.5); // Downwards
      } else if (side === 1) { // Right
        comet.x = canvas.width / 2 + buffer;
        comet.y = Math.random() * canvas.height - canvas.height / 2;
        comet.angle = Math.PI + (Math.random() - 0.5); // Leftwards
      } else if (side === 2) { // Bottom
        comet.x = Math.random() * canvas.width - canvas.width / 2;
        comet.y = canvas.height / 2 + buffer;
        comet.angle = -Math.PI / 2 + (Math.random() - 0.5); // Upwards
      } else { // Left
        comet.x = -canvas.width / 2 - buffer;
        comet.y = Math.random() * canvas.height - canvas.height / 2;
        comet.angle = (Math.random() - 0.5); // Rightwards
      }

      comet.speed = Math.random() * 10 + 15;
      comet.length = Math.random() * 50 + 80;
    };

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 1. Draw Stars
      ctx.fillStyle = starColor;
      stars.forEach((star) => {
        star.z -= speed * 100;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 2;
          star.y = (Math.random() - 0.5) * canvas.height * 2;
          star.z = Z_DEPTH;
        }

        const x = (star.x / star.z) * canvas.width + cx;
        const y = (star.y / star.z) * canvas.height + cy;
        // Adjust size based on Z_DEPTH instead of canvas width
        const size = (1 - star.z / Z_DEPTH) * 2;

        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height && size > 0) {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Draw Planets
      planets.forEach((planet) => {
        planet.z -= speed * 150;

        if (planet.z <= 0) {
          planet.x = (Math.random() - 0.5) * canvas.width * 2;
          planet.y = (Math.random() - 0.5) * canvas.height * 2;
          planet.z = Z_DEPTH * 1.5; // Start further back
          planet.radius = Math.random() * 30 + 10;
          planet.color = planetColors[Math.floor(Math.random() * planetColors.length)];
        }

        const x = (planet.x / planet.z) * canvas.width + cx;
        const y = (planet.y / planet.z) * canvas.height + cy;
        const size = (1 - planet.z / (Z_DEPTH * 1.5)) * planet.radius;

        if (x + size >= 0 && x - size < canvas.width && y + size >= 0 && y - size < canvas.height && size > 0) {
          const gradient = ctx.createRadialGradient(x - size / 3, y - size / 3, size / 4, x, y, size);
          gradient.addColorStop(0, planet.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0.8)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add a ring for some planets
          if (planet.radius > 25) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = size / 5;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 1.8, size * 0.4, Math.PI / 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // 3. Draw Social Packets
      // Spawn new ones occasionally
      if (socialPackets.length < 8 && Math.random() < 0.02) {
        spawnSocialPacket();
      }

      for (let i = socialPackets.length - 1; i >= 0; i--) {
        const p = socialPackets[i];
        p.z -= speed * 120; // Slightly different speed
        p.rotation += p.rotSpeed;

        if (p.z <= 10) {
          socialPackets.splice(i, 1);
          continue;
        }

        const x = (p.x / p.z) * canvas.width + cx;
        const y = (p.y / p.z) * canvas.height + cy;
        const scale = (1 - p.z / Z_DEPTH);
        const size = Math.max(0, scale * p.baseSize * 1.5);

        // Opacity based on Z (fade in vs fade out)
        const opacity = Math.min(1, scale * 1.5);

        if (size > 0 && p.z < Z_DEPTH) {
          const img = socialImagesRef.current[p.iconIndex];
          if (img && img.complete) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = opacity;
            // Draw with a glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 15;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
          }
        }
      }

      // 4. Draw Comets
      comets.forEach((comet) => {
        if (!comet.active) {
          if (Math.random() < 0.005) spawnComet(comet);
          return;
        }

        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;

        const x = comet.x + cx;
        const y = comet.y + cy;

        if (x < -200 || x > canvas.width + 200 || y < -200 || y > canvas.height + 200) {
          comet.active = false;
        } else {
          // Draw Comet Trail
          const grad = ctx.createLinearGradient(
            x, y,
            x - Math.cos(comet.angle) * comet.length,
            y - Math.sin(comet.angle) * comet.length
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - Math.cos(comet.angle) * comet.length,
            y - Math.sin(comet.angle) * comet.length
          );
          ctx.stroke();

          // Comet Head
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 10;
          ctx.shadowColor = 'cyan';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Initial setup
    resizeCanvas();
    initObjects();
    draw();

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      initObjects();
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, backgroundColor, starColor, starCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full"
      style={{ background: backgroundColor }}
    />
  );
}
