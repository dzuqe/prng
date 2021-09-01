import MyAlgoConnect from '@randlabs/myalgo-connect';
import {CallApplTxn} from '@randlabs/myalgo-connect';
import algosdk from 'algosdk';

const dead = "https://i.imgur.com/v7jtN5a.png";
const shatter = "https://i.imgur.com/ks36bpu.gif";
const intro = "https://i.imgur.com/IQT5yTp.png";

class App {
  elem: HTMLElement;
  wallet: any;
  algodClient: any;
  accounts: any;
  addresses: any;
  isConnected: boolean;
  gamestate: object;
  btns: HTMLElement;
  //appid: number = 295983464;
  //appid: number = 296114567;
  appid: number = 296143611;
  msg: HTMLElement;
  maxhit: number = 10;

  constructor() {
    this.elem = document.createElement('div');
    this.elem.id = 'viewport';
    this.elem.className = 'viewport';
    this.wallet = new MyAlgoConnect();
    //this.algodClient = new algosdk.Algodv2(
    //  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 
    //  'http://127.0.0.1', 
    //  '4001'
    //);
    this.algodClient = new algosdk.Algodv2(
      '', 
      'https://api.algoexplorer.io', 
      ''
    );
    this.gamestate = null;

    let disp = document.createElement('div');
    disp.id = "health";
    disp.innerHTML = `<div class="health">
      <img src="https://publicdomainpictures.net/pictures/260000/nahled/medical-sign.jpg" />
      <div class="desc">
        Bullet location: ?<br/>
        Hits: ?<br/>
        Misses: ?<br/>
      </div>
    </div>`;
 
    let dp = document.createElement('div');
    dp.id = "buttons";
    this.btns = dp;

    this.elem.appendChild(disp);
    this.elem.appendChild(dp);
    this.elem.appendChild(this.getImage('https://66.media.tumblr.com/6c1420bae4cf047833b1626c4aa68349/tumblr_ofxojeul5m1qzl9pho1_500.gif'));

    let msg = document.createElement('div');
    msg.className = "message-box";
    msg.id = "message";
    msg.innerText = "dont kill me app.";
    this.msg = msg;

    this.elem.appendChild(msg);
  }

  getImage(title='/assets/intro.gif') {
    let img = document.createElement('img');
    img.id = 'clip';
    img.src = title; 
    img.style.width = "100%";
    return img;
  }

  async connect() {
    try {
      this.isConnected = true;
      this.accounts = await this.wallet.connect();
      this.addresses = this.accounts.map(account => account.address);

      document.getElementById("connect").style.display = 'none';
      document.getElementById("call").style.display = 'block';

      this.updateImage(intro);
      this.readapp();
    } catch(err) {
      console.error(err);
    }
  }

  async callapp() {
    try {
      let txnn = await this.algodClient.getTransactionParams().do();
      let txn: CallApplTxn = {
        ...txnn,
        from: this.addresses[0],
        fee: 1000,
        flatFee: true,
        appIndex: this.appid,
        type: 'appl',
        appArgs: [btoa("take_shot")],
        appOnComplete: 0,
      };

      let signedTxn = await this.wallet.signTransaction(txn);
      await this.algodClient.sendRawTransaction(signedTxn.blob).do();
      this.readapp();
      this.updateImage(intro);
    } catch(err) {
      console.log("errored or died: " + this.gamestate.hit.uint + " > 10");
      this.updateImage(dead);
      console.error(err);
    }
  }

  async readapp() {
    try {
      let app = await this.algodClient.getApplicationByID(this.appid).do();
      var p = {};
      for (var key in app.params['global-state']) {
        let r = app.params['global-state'][key];
        p[atob(r.key)] = r.value;
      }

      if (this.gamestate !== null) {
        if (this.gamestate.hit.uint >= this.maxhit) {
          console.log("dead: " + this.gamestate.hit.uint + " > 10");
          this.msg.innerText = "dead: " + this.gamestate.hit.uint + " > ";
          this.updateImage(dead);
          return ;
        }
        if (this.gamestate.hit.uint !== p.hit.uint) {
          console.log('got hit');
          this.msg.innerText = 'got hit';
          this.updateImage(shatter);
        } 
        if (this.gamestate.miss.uint !== p.miss.uint) {
          console.log('missed');
          this.msg.innerText = 'missed';
          this.updateImage(intro);
        }
      } else {
        if (p.hit.uint >= this.maxhit) {
          console.log("dead: " + p.hit.uint + " > 10");
          this.msg.innerText = "dead: " + p.hit.uint + " > 10";
          this.updateImage(dead);
        } else {
          this.msg.innerText = "nothing to see here";
        }
      }

      this.gamestate = p;
      let disp = document.getElementById('health');
      disp.innerHTML = `<div class="health">
        <img src="https://publicdomainpictures.net/pictures/260000/nahled/medical-sign.jpg" />
        <div class="desc">
          Bullet location: ${this.gamestate.bullet_loc.uint}<br/>
          Hits: ${this.gamestate.hit.uint} of ${this.maxhit}<br/>
          Misses: ${this.gamestate.miss.uint}<br/>
        </div>
      </div>`;
    } catch (err) {
      console.error(err);
    }
  }
  
  addbtn(b: HTMLElement) {
    this.btns.appendChild(b);
  }

  updateImage(title) {
    let clip = document.getElementById('clip');
    clip.src = title;
  }

  render() {
    return this.elem;
  }
};

let app: App = new App();

let btn = document.createElement('button');
btn.id = "connect"
btn.innerText = "Connect Wallet";
btn.onclick = async function() {
  app.connect();
}

let callappbtn = document.createElement('button');
callappbtn.id = "call";
callappbtn.style.display = "none";
callappbtn.innerText = "Call App";
callappbtn.onclick = async function() {
  app.callapp();
}

app.addbtn(btn);
app.addbtn(callappbtn);

window['app'] = app;

document.getElementById('root').appendChild(app.render());

let msg = `
  disclaimer: the <a href="https://algoexplorer.io/application/${app.appid}">contract</a>  is just a lame <a href="https://en.wikipedia.org/wiki/Linear_congruential_generator">prng</a>. <a href="https://twitter.com/dzuqe">@dzuqe</a> didnt even have the audacity to audit it. use at your own risk. you need to have a wallet at <a href="wallet.myalgo.com/">myalgo</a>. <img src="https://icodrops.com/wp-content/uploads/2018/03/Algorand-logo.jpg" style="width: 16px"/></a> send shekels here mane: K7I7U3PC3XLWKSTSR2S2XAUJ5EK6YNWVSAU33L42QVFSRH4X4G6EG4Z6MQ
`;

let msge = document.createElement('p');
msge.innerHTML = msg;
msge.style = "width: 480px; margin: 0 auto; background-color: gray";

document.getElementById('root').appendChild(app.render());
document.getElementById('root').appendChild(msge);
