import type { Page } from '@playwright/test';

export async function fakeTwitch(page: Page) {
  await page.route('https://www.twitch.tv/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<body style="background:#151718;color:#ddd">Test chat</body>' }));
  await page.route('https://player.twitch.tv/**', route => {
    if (!route.request().url().includes('/js/embed/v1.js')) return route.fulfill({ contentType: 'text/html', body: '<body style="background:#0e1012;color:#bbb">Controlled video fixture</body>' });
    return route.fulfill({ contentType: 'text/javascript', body: `
      window.__players = {};
      window.__calls = [];
      class Player {
        static READY='ready'; static ONLINE='online'; static OFFLINE='offline'; static PLAY='play';
        static PLAYING='playing'; static PAUSE='pause'; static PLAYBACK_BLOCKED='blocked';
        constructor(id, options) {
          this.channel=options.channel; this.listeners={}; this.muted=true; this.volume=0.5; this.quality='auto'; this.paused=true;
          const frame=document.createElement('iframe'); frame.src='https://player.twitch.tv/?channel='+this.channel; frame.title=this.channel;
          document.getElementById(id).append(frame); window.__players[this.channel]=this;
          window.__calls.push(['create',this.channel]);
          setTimeout(()=>{this.emit('ready');this.emit('online');},20);
        }
        addEventListener(e,f){(this.listeners[e]??=[]).push(f)}
        removeEventListener(e,f){this.listeners[e]=(this.listeners[e]??[]).filter(x=>x!==f)}
        emit(e){for(const f of this.listeners[e]??[])f()}
        play(){this.paused=false;window.__calls.push(['play',this.channel]);this.emit('play');this.emit('playing')}
        pause(){this.paused=true;window.__calls.push(['pause',this.channel]);this.emit('pause')}
        setMuted(v){this.muted=v;window.__calls.push(['mute',this.channel,v])} getMuted(){return this.muted}
        setVolume(v){this.volume=v} getVolume(){return this.volume}
        setQuality(v){this.quality=v;window.__calls.push(['quality',this.channel,v])} getQuality(){return this.quality}
        getQualities(){return [{group:'auto',name:'Auto'},{group:'chunked',name:'1080p60'},{group:'720p60',name:'720p60'},{group:'480p',name:'480p'}]}
        isPaused(){return this.paused}
      }
      window.Twitch={Player};
    ` });
  });
}
