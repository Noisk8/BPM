import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: { 
    initialColorMode: "dark", 
    useSystemColorMode: false 
  },
  colors: {
    bpm: {
      blue: "#3182CE",    // 70-90 BPM
      green: "#38A169",   // 90-100 BPM
      yellow: "#ECC94B",  // 100-110 BPM
      orange: "#DD6B20",  // 110-120 BPM
      red: "#E53E3E",     // 120-130 BPM
      purple: "#805AD5"   // 130-140 BPM
    }
  }
});

export default theme;
