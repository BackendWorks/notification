import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
// import { join } from 'path';

@Injectable()
export class FirebaseService {
  constructor() {
    // firebase.initializeApp({
    //   credential: firebase.credential.cert(
    //     join(__dirname, '..', 'firebase.config.json'),
    //   ),
    // });
  }

  public sendMessage(
    token: string,
    message?: string,
    payload?: any,
  ): Promise<string> {
    return firebase.messaging().send({
      token,
      notification: {
        body: message,
      },
      data: payload,
    });
  }

  public async multiCastMessage(
    tokens: [],
    message?: string,
    payload?: any,
  ): Promise<firebase.messaging.BatchResponse> {
    return firebase.messaging().sendMulticast({
      tokens,
      notification: {
        body: message,
      },
      data: payload,
    });
  }
}
