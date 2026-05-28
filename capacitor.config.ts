import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.agg.simulator',
  appName: 'Aggregator Simulator',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
  },
}

export default config
