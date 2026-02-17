import requests,uuid
Gold_Headers = {'Host': 'odpapp.asiacell.com','X-Odp-Api-Key': '1ccbc4c913bc4ce785a0a2de444aa0d6','Cache-Control': 'no-cache','Deviceid': 'fcf5d75d-d7e7-452d-bc65-246d5c4d1020','X-Os-Version': '9','X-Device-Type': '[Android][google][G011A 9][P][HMS][4.2.1:90000263]','X-Odp-App-Version': '4.2.1','X-From-App': 'odp','X-Odp-Channel': 'mobile','X-Screen-Type': 'false','Content-Type': 'application/json; charset=UTF-8','User-Agent': 'okhttp/5.0.0-alpha.2','Connection': 'keep-alive',}
Gold_Params =  {'lang': 'ar',}
Gold_Json = {'PID': str(uuid.uuid4()),'passcode': 'coooood',} # - كود الي وصلك بعد ما طلبت استبدله بـ (  coooood ) .
Gold_Response = requests.post('https://odpapp.asiacell.com/api/v1/smsvalidation',params=Gold_Params,headers=Gold_Headers,json=Gold_Json,).text
print(Gold_Response)