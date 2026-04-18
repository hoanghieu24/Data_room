import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
} from "@mui/material";
import {
  SportsEsports as GameIcon,
  EmojiEvents as TrophyIcon,
  RestartAlt as RestartIcon,
  TrendingUp as ScoreIcon,
} from "@mui/icons-material";
import avatarImg from "../../assets/image.png";

// Cấu hình game
const WIDTH = 400;
const HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.3;
const JUMP_FORCE = -3;
const PIPE_SPEED = 2;

export default function FlappyBird() {
  const [birdY, setBirdY] = useState(HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [frame, setFrame] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("flappy_highscore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("flappy_highscore", score);
    }
  }, [score, highScore]);

  // Jump function
  const jump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    setVelocity(JUMP_FORCE);
  }, [isPlaying, gameOver]);

  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver, jump]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update bird physics
      setVelocity(v => {
        const newV = v + GRAVITY;
        setBirdY(y => {
          let newY = y + newV;
          // Check ceiling and floor collision
          if (newY <= 0 || newY >= HEIGHT - BIRD_SIZE) {
            endGame();
            return y;
          }
          return newY;
        });
        return newV;
      });

      // Move pipes and generate new ones
      setPipes(prev => {
        let updated = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        })).filter(pipe => pipe.x + PIPE_WIDTH > 0);

        // Generate new pipe every 120 frames
        if (frame % 120 === 0) {
          const pipeHeight = Math.random() * (HEIGHT - PIPE_GAP - 100) + 50;
          updated.push({
            id: Date.now(),
            x: WIDTH,
            topHeight: pipeHeight,
            bottomY: pipeHeight + PIPE_GAP,
            passed: false
          });
        }

        // Check collision with pipes
        const birdRect = {
          x: 50,
          y: birdY,
          width: BIRD_SIZE,
          height: BIRD_SIZE
        };

        for (const pipe of updated) {
          const topPipeRect = {
            x: pipe.x,
            y: 0,
            width: PIPE_WIDTH,
            height: pipe.topHeight
          };
          const bottomPipeRect = {
            x: pipe.x,
            y: pipe.bottomY,
            width: PIPE_WIDTH,
            height: HEIGHT - pipe.bottomY
          };

          if (
            (birdRect.x < topPipeRect.x + topPipeRect.width &&
             birdRect.x + birdRect.width > topPipeRect.x &&
             birdRect.y < topPipeRect.y + topPipeRect.height &&
             birdRect.y + birdRect.height > topPipeRect.y) ||
            (birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
             birdRect.x + birdRect.width > bottomPipeRect.x &&
             birdRect.y < bottomPipeRect.y + bottomPipeRect.height &&
             birdRect.y + birdRect.height > bottomPipeRect.y)
          ) {
            endGame();
          }

          // Increase score when passing pipe
          if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
            pipe.passed = true;
            setScore(s => s + 1);
          }
        }

        return updated;
      });

      setFrame(f => f + 1);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, birdY, frame]);

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
  };

  const startGame = () => {
    setBirdY(HEIGHT / 2);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setFrame(0);
  };

  // Get bird rotation angle
  const getBirdRotation = () => {
    if (velocity < 0) return "-30deg";
    if (velocity > 5) return "45deg";
    return "0deg";
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
      <Box>
        {/* Score Board */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Box display="flex" alignItems="center" gap={1}>
                <ScoreIcon sx={{ color: "white" }} />
                <Typography variant="h4" fontWeight="bold" color="white">
                  {score}
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box display="flex" alignItems="center" gap={1}>
                <TrophyIcon sx={{ color: "gold" }} />
                <Typography variant="h5" fontWeight="bold" color="white">
                  {highScore}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Game Canvas */}
        <Box
          sx={{
            position: "relative",
            width: WIDTH,
            height: HEIGHT,
            margin: "0 auto",
            backgroundColor: "#87CEEB",
            overflow: "hidden",
            borderRadius: "16px",
            cursor: "pointer",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            border: "3px solid #fff",
          }}
          onClick={() => {
            if (!isPlaying && !gameOver) startGame();
            else jump();
          }}
        >
          {/* Clouds */}
          <Box sx={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  top: 50 + i * 150,
                  left: `${(Date.now() * 0.02 + i * 200) % (WIDTH + 100) - 50}px`,
                  width: 80,
                  height: 50,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: "50%",
                  transition: "left 0.1s linear",
                }}
              />
            ))}
          </Box>

          {/* Pipes */}
          {pipes.map(pipe => (
            <React.Fragment key={pipe.id}>
              {/* Top pipe */}
              <Box sx={{
                position: "absolute",
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                background: "linear-gradient(180deg, #228B22, #006400)",
                borderBottom: "4px solid #8B4513",
                borderRadius: "0 0 8px 8px",
              }}>
                <Box sx={{
                  position: "absolute",
                  bottom: -20,
                  left: -10,
                  width: PIPE_WIDTH + 20,
                  height: 20,
                  background: "#006400",
                  borderRadius: "8px",
                }} />
              </Box>
              
              {/* Bottom pipe */}
              <Box sx={{
                position: "absolute",
                left: pipe.x,
                top: pipe.bottomY,
                width: PIPE_WIDTH,
                height: HEIGHT - pipe.bottomY,
                background: "linear-gradient(180deg, #228B22, #006400)",
                borderTop: "4px solid #8B4513",
                borderRadius: "8px 8px 0 0",
              }}>
                <Box sx={{
                  position: "absolute",
                  top: -20,
                  left: -10,
                  width: PIPE_WIDTH + 20,
                  height: 20,
                  background: "#006400",
                  borderRadius: "8px",
                }} />
              </Box>
            </React.Fragment>
          ))}

          {/* Bird */}
          <Box
            sx={{
              position: "absolute",
              left: 50,
              top: birdY,
              width: BIRD_SIZE,
              height: BIRD_SIZE,
              transition: "transform 0.1s ease",
              transform: `rotate(${getBirdRotation()})`,
              zIndex: 10,
            }}
          >
            <Box
    component="img"
    src={avatarImg}
    alt="avatar"
    sx={{
      width: "300%",
      height: "300%",
      objectFit: "cover",
      borderRadius: "50%",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    }}
  />
</Box>

          {/* Ground */}
          <Box sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(180deg, #8B6914, #654321)",
          }}>
            <Box sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 10,
              background: "#228B22",
            }} />
          </Box>

          {/* Start overlay */}
          {!isPlaying && !gameOver && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >
              <Paper sx={{ maxWidth: 300, m: 2, p: 3, textAlign: "center" }}>
                <GameIcon sx={{ fontSize: 50, color: "#FFD700" }} />
                <Typography variant="h5" gutterBottom>Flappy Bird</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  🎮 Nhấn SPACE hoặc CLICK để bay lên
                  <br />
                  🐦 Tránh va vào ống nước
                  <br />
                  ⭐ Càng bay xa càng nhiều điểm
                </Typography>
                <Button variant="contained" size="large" onClick={startGame} fullWidth>
                  Bắt đầu chơi
                </Button>
              </Paper>
            </Box>
          )}

          {/* Game over overlay */}
          {gameOver && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >
              <Paper sx={{ maxWidth: 300, m: 2, p: 3, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom color="error">Game Over!</Typography>
                <Typography variant="h3" color="primary" gutterBottom>
                  {score}
                </Typography>
                {score === highScore && score > 0 && (
                  <Chip label="🏆 NEW HIGH SCORE! 🏆" color="error" sx={{ mb: 2 }} />
                )}
                <Button
                  variant="contained"
                  size="large"
                  onClick={startGame}
                  startIcon={<RestartIcon />}
                  fullWidth
                >
                  Chơi lại
                </Button>
              </Paper>
            </Box>
          )}
        </Box>

        {/* Instruction */}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Chip
            icon={<GameIcon />}
            label="Nhấn SPACE hoặc CLICK để chơi / bay lên"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
    </Container>
  );
}