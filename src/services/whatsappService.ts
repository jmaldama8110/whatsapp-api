
import axios from "axios";


export async function sendMessage( textMsg: string, phoneNumber: string ){

    const waApiVersion = process.env.WHATSAPP_API_VERSION;
    const waPhoneNumberId = process.env.WHATSAPP_API_PHONE_NUMBER_ID;
    const waToken = process.env.WHATSAPP_ADMIN_USER_TOKEN;
    const url = `/${waApiVersion}/${waPhoneNumberId}/messages`;

        const api = axios.create({
            method: "post",
            url,
            baseURL: process.env.WHATSAPP_API_URL,
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${waToken}`,
            },
          });
    
    const country = phoneNumber.slice(0,2);
    let mexFormat = phoneNumber; 
    if( country == '52'){ // only mexico phone Numbers
        if( phoneNumber.length == 13)
                mexFormat = `${52}${phoneNumber.slice(-10)}`
    }
    const waApiRes = await api.post(url, {
        "messaging_product": "whatsapp",    
        "recipient_type": "individual",
        "to": country == '52' ? mexFormat : phoneNumber,
        "type": "text",
        "text": {
            "preview_url": false,
            "body": textMsg
        }
    
    });   
}