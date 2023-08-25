import * as Nano from 'nano';

interface iConfig extends Nano.MaybeDocument {
    welcome_message?: string;
}

export class ConfigDocument implements iConfig {

    _id: string | undefined
    _rev: string | undefined
    welcome_message?: string;

    constructor(){
        this._id = undefined
        this._rev = undefined
        this.welcome_message = ''
    }
}