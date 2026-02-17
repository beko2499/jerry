import requests
Gold_Headers = {'Host': 'odpapp.asiacell.com','X-Odp-Api-Key': '1ccbc4c913bc4ce785a0a2de444aa0d6','Cache-Control': 'no-cache','Deviceid': 'fcf5d75d-d7e7-452d-bc65-246d5c4d1020','X-Os-Version': '9','X-Device-Type': '[Android][google][G011A 9][P][HMS][4.2.1:90000263]','X-Odp-App-Version': '4.2.1','X-From-App': 'odp','X-Odp-Channel': 'mobile','X-Screen-Type': 'MOBILE','Authorization': 'Bearer <access_token>','User-Agent': 'okhttp/5.0.0-alpha.2','Connection': 'keep-alive',}
Gold_Params =  {'lang': 'ar','theme': 'avocado',}
Gold_Response = requests.post('https://odpapp.asiacell.com/api/v2/spinwheel/confirm',params=Gold_Params,headers=Gold_Headers).text
print(Gold_Response)