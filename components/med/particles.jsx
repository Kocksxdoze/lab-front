"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { Box } from "@chakra-ui/react";

const ParticlesComponent = () => {
  const particlesInit = useCallback(async (engine) => {
    try {
      await loadSlim(engine);
    } catch (error) {
      console.error("Error loading particles.js:", error);
    }
  }, []);

  return (
    <Particles
      id="tsparticles"
      className="particles-blur absolute inset-0"
      init={particlesInit}
      options={{
        background: { color: "#E7E7E3" },
        particles: {
          number: { value: 120, density: { enable: true, value_area: 850 } },
          shape: {
            type: "character",
            character: {
              value: "+",
              font: "Arial",
              style: "",
              weight: "bold",
              fill: true,
            },
          },
          color: { value: ["#4ca6ff", "#00cc99", "#66d9ff"] },
          opacity: { value: 0.8, random: false },
          size: { value: 12, random: true },
          move: { enable: true, speed: 0.3, outModes: "out" },
          links: {
            enable: true,
            distance: 180,
            color: "#4ca6ff",
            opacity: 0.6,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: true, mode: "repulse" },
          },
          modes: { repulse: { distance: 150, duration: 0.4 } },
        },
      }}
    />
  );
};

export default ParticlesComponent;
