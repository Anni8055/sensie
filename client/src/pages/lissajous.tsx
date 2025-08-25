import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LissajousPoint {
  x: number;
  y: number;
}

interface PresetPattern {
  name: string;
  icon: string;
  leftFreq: number;
  rightFreq: number;
  phase: number;
}

const presetPatterns: PresetPattern[] = [
  { name: "Circle", icon: "○", leftFreq: 1000, rightFreq: 1000, phase: 90 },
  { name: "Figure-8", icon: "∞", leftFreq: 1000, rightFreq: 2000, phase: 0 },
  { name: "3-Loop", icon: "※", leftFreq: 1000, rightFreq: 3000, phase: 45 },
  { name: "Star", icon: "✦", leftFreq: 1000, rightFreq: 2500, phase: 30 },
];

export default function LissajousGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const frameCountRef = useRef<number>(0);
  const lastFPSUpdateRef = useRef<number>(Date.now());

  // Pattern parameters
  const [leftFreq, setLeftFreq] = useState(1000);
  const [rightFreq, setRightFreq] = useState(1000);
  const [phaseDeg, setPhaseDeg] = useState(90);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [trailLength, setTrailLength] = useState(8192);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  
  // Display state
  const [fps, setFps] = useState(60);
  const [activePreset, setActivePreset] = useState("Circle");

  const generateLissajousPoints = useCallback((numPoints: number = 8192): LissajousPoint[] => {
    const points: LissajousPoint[] = [];
    const timeStep = 0.001 * animationSpeed;
    const currentTime = (Date.now() - startTimeRef.current) * 0.001 * animationSpeed;

    for (let i = 0; i < numPoints; i++) {
      const t = currentTime + i * timeStep;
      const x = Math.sin(2 * Math.PI * rightFreq * t / 1000);
      const y = Math.sin(2 * Math.PI * leftFreq * t / 1000 + (phaseDeg * Math.PI / 180));
      points.push({ x, y });
    }

    return points;
  }, [leftFreq, rightFreq, phaseDeg, animationSpeed]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;

    ctx.strokeStyle = 'rgba(42, 42, 62, 0.5)';
    ctx.lineWidth = 1;

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 200;

    // Grid lines
    for (let i = -2; i <= 2; i++) {
      const x = centerX + (i * scale) / 2;
      const y = centerY + (i * scale) / 2;

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [showGrid]);

  const drawAxes = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showAxes) return;

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
    ctx.lineWidth = 2;

    const centerX = width / 2;
    const centerY = height / 2;

    // X axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
  }, [showAxes]);

  const drawPattern = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const points = generateLissajousPoints(trailLength);
    if (points.length < 2) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 200;

    // Create gradient for trail effect
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 1)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw the pattern
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const x = centerX + point.x * scale;
      const y = centerY - point.y * scale; // Flip Y for screen coordinates

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw current point with glow
    const currentPoint = points[points.length - 1];
    const currentX = centerX + currentPoint.x * scale;
    const currentY = centerY - currentPoint.y * scale;

    ctx.shadowColor = '#00D4FF';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00D4FF';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [generateLissajousPoints, trailLength]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw elements in order
    drawGrid(ctx, width, height);
    drawAxes(ctx, width, height);
    drawPattern(ctx, width, height);

    // Update FPS counter
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFPSUpdateRef.current > 1000) {
      const newFps = Math.round(frameCountRef.current * 1000 / (now - lastFPSUpdateRef.current));
      setFps(newFps);
      frameCountRef.current = 0;
      lastFPSUpdateRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [drawGrid, drawAxes, drawPattern]);

  // Calculate frequency ratio
  const getFrequencyRatio = useCallback(() => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(leftFreq, rightFreq);
    const leftRatio = leftFreq / divisor;
    const rightRatio = rightFreq / divisor;
    return `${leftRatio}:${rightRatio}`;
  }, [leftFreq, rightFreq]);

  // Get pattern info
  const getPatternInfo = useCallback(() => {
    let patternName = 'Custom';
    let symmetry = 'Complex';

    if (leftFreq === rightFreq) {
      if (phaseDeg === 90 || phaseDeg === 270) {
        patternName = 'Circle';
        symmetry = 'Circular';
      } else if (phaseDeg === 0 || phaseDeg === 180) {
        patternName = 'Line';
        symmetry = 'Linear';
      } else {
        patternName = 'Ellipse';
        symmetry = 'Elliptical';
      }
    } else if (rightFreq === 2 * leftFreq || leftFreq === 2 * rightFreq) {
      patternName = 'Figure-8';
      symmetry = 'Figure-8';
    }

    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(leftFreq, rightFreq);
    const leftRatio = leftFreq / divisor;
    const rightRatio = rightFreq / divisor;
    const period = Math.max(leftRatio, rightRatio);

    return { patternName, symmetry, period };
  }, [leftFreq, rightFreq, phaseDeg]);

  const handlePresetClick = useCallback((preset: PresetPattern) => {
    setLeftFreq(preset.leftFreq);
    setRightFreq(preset.rightFreq);
    setPhaseDeg(preset.phase);
    setActivePreset(preset.name);
  }, []);

  // Start animation on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  const frequencyRatio = getFrequencyRatio();
  const patternInfo = getPatternInfo();

  return (
    <div className="flex h-screen bg-cosmic-black text-white font-inter overflow-hidden">
      {/* Visualization Panel */}
      <div className="flex-1 flex flex-col p-6 relative">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cosmic-blue mb-2" data-testid="title-header">
            Lissajous Pattern Generator
          </h1>
          <p className="text-gray-400 text-sm" data-testid="text-subtitle">
            Interactive wave interference visualization
          </p>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="pattern-canvas border border-cosmic-gray rounded-xl glow-effect"
              data-testid="canvas-lissajous"
            />

            {/* Pattern Info Overlay */}
            <div className="absolute top-4 left-4 glass-effect rounded-lg p-3" data-testid="overlay-pattern-info">
              <div className="text-xs text-gray-300 space-y-1">
                <div>
                  Freq Ratio: <span className="text-cosmic-blue font-medium" data-testid="text-freq-ratio">{frequencyRatio}</span>
                </div>
                <div>
                  Phase: <span className="text-cosmic-blue font-medium" data-testid="text-phase-display">{phaseDeg}°</span>
                </div>
                <div>
                  Pattern: <span className="text-cosmic-blue font-medium" data-testid="text-pattern-name">{patternInfo.patternName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 glass-effect rounded-lg p-4" data-testid="status-bar">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" data-testid="indicator-realtime"></div>
                <span className="text-gray-300">Real-time</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-gray-300">
                FPS: <span className="text-cosmic-blue font-medium" data-testid="text-fps">{fps}</span>
              </div>
            </div>
            <div className="text-gray-300">
              Points: <span className="text-cosmic-blue font-medium" data-testid="text-points">{trailLength}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-cosmic-dark border-l border-cosmic-gray p-6 overflow-y-auto">
        {/* Preset Patterns */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-cosmic-blue" data-testid="title-presets">Preset Patterns</h3>
          <div className="grid grid-cols-2 gap-3">
            {presetPatterns.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => handlePresetClick(preset)}
                variant="ghost"
                className={`h-auto p-3 text-sm font-medium border border-transparent transition-all duration-200 ${
                  activePreset === preset.name
                    ? 'bg-cosmic-blue text-cosmic-black border-cosmic-blue'
                    : 'bg-cosmic-gray hover:bg-cosmic-blue hover:text-cosmic-black hover:border-cosmic-blue'
                }`}
                data-testid={`button-preset-${preset.name.toLowerCase()}`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div>{preset.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Frequency Controls */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-cosmic-blue" data-testid="title-frequency">Frequency Control</h3>

          {/* Left Channel */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Left Channel (Y-axis)
            </label>
            <div className="space-y-2">
              <Slider
                value={[leftFreq]}
                onValueChange={(value) => setLeftFreq(value[0])}
                min={100}
                max={5000}
                step={100}
                className="slider-track"
                data-testid="slider-left-freq"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>100 Hz</span>
                <span className="text-cosmic-blue font-medium" data-testid="text-left-freq">{leftFreq} Hz</span>
                <span>5000 Hz</span>
              </div>
            </div>
          </div>

          {/* Right Channel */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Right Channel (X-axis)
            </label>
            <div className="space-y-2">
              <Slider
                value={[rightFreq]}
                onValueChange={(value) => setRightFreq(value[0])}
                min={100}
                max={5000}
                step={100}
                className="slider-track"
                data-testid="slider-right-freq"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>100 Hz</span>
                <span className="text-cosmic-blue font-medium" data-testid="text-right-freq">{rightFreq} Hz</span>
                <span>5000 Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Control */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-cosmic-blue" data-testid="title-phase">Phase Control</h3>
          <div className="space-y-2">
            <Slider
              value={[phaseDeg]}
              onValueChange={(value) => setPhaseDeg(value[0])}
              min={0}
              max={360}
              step={5}
              className="slider-track"
              data-testid="slider-phase"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0°</span>
              <span className="text-cosmic-blue font-medium" data-testid="text-phase">{phaseDeg}°</span>
              <span>360°</span>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-cosmic-blue" data-testid="title-display">Display Options</h3>

          {/* Trail Length */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Trail Length
            </label>
            <div className="space-y-2">
              <Slider
                value={[trailLength]}
                onValueChange={(value) => setTrailLength(value[0])}
                min={1000}
                max={16384}
                step={1000}
                className="slider-track"
                data-testid="slider-trail"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Short</span>
                <span className="text-cosmic-blue font-medium" data-testid="text-trail">{trailLength}</span>
                <span>Long</span>
              </div>
            </div>
          </div>

          {/* Animation Speed */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Animation Speed
            </label>
            <div className="space-y-2">
              <Slider
                value={[animationSpeed]}
                onValueChange={(value) => setAnimationSpeed(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="slider-track"
                data-testid="slider-speed"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Slow</span>
                <span className="text-cosmic-blue font-medium" data-testid="text-speed">{animationSpeed.toFixed(1)}x</span>
                <span>Fast</span>
              </div>
            </div>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Show Grid</label>
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
                data-testid="switch-grid"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Show Axes</label>
              <Switch
                checked={showAxes}
                onCheckedChange={setShowAxes}
                data-testid="switch-axes"
              />
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <Card className="glass-effect border-cosmic-gray" data-testid="card-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-cosmic-blue">Pattern Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Frequency Ratio:</span>
              <span className="text-cosmic-blue" data-testid="text-info-ratio">{frequencyRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>Period (cycles):</span>
              <span className="text-cosmic-blue" data-testid="text-info-period">{patternInfo.period}</span>
            </div>
            <div className="flex justify-between">
              <span>Symmetry:</span>
              <span className="text-cosmic-blue" data-testid="text-info-symmetry">{patternInfo.symmetry}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
