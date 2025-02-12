declare module 'videojs-vast-vpaid' {
    import videojs from 'video.js';
  
    interface VastClientOptions {
      adTagUrl: string;
      playAdAlways?: boolean;
      adCancelTimeout?: number;
      adsEnabled?: boolean;
    }
  
    interface VastPlugin {
      vastClient(options: VastClientOptions): void;
    }
  
    const vastPlugin: (player: videojs.Player) => VastPlugin;
    export default vastPlugin;
  }
  