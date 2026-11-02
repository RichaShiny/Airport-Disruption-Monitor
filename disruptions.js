import {XMLParser,XMLValidator} from 'fast-xml-parser';
const array=x=>x==null?[]:Array.isArray(x)?x:[x];
export function parseFAA(xml){
 if(XMLValidator.validate(xml)!==true)throw new Error('Invalid FAA XML');
 const root=new XMLParser({ignoreAttributes:false,parseTagValue:false}).parse(xml).AIRPORT_STATUS_INFORMATION;
 if(!root||!root.Update_Time)throw new Error('Unexpected FAA feed format');
 const events=[];
 for(const group of array(root.Delay_type)){
 const items=[...array(group.Ground_Stop_List?.Program),...array(group.Ground_Delay_List?.Ground_Delay),...array(group.Arrival_Departure_Delay_List?.Delay),...array(group.Airport_Closure_List?.Airport)];
 for(const p of items){if(!p.ARPT)continue;const d=p.Arrival_Departure||{};events.push({airport:p.ARPT,type:group.Name,reason:p.Reason||'No reason supplied',average:p.Avg||null,min:d.Min||null,max:p.Max||d.Max||null,trend:d.Trend||null,direction:d['@_Type']||null,end:p.End_Time||p.Reopen||null,start:p.Start||null});}
 }
 return {updatedAt:root.Update_Time,events};
}
export function weatherFlag(metar,now=Date.now()){
 if(!metar)return 'Weather unavailable';
 if(!Number.isFinite(metar.obsTime)||now-metar.obsTime*1000>90*60000)return 'Stale weather';
 if(['IFR','LIFR'].includes(metar.fltCat))return 'Low visibility / ceiling';
 if(Number(metar.wgst)>=25||Number(metar.wspd)>=25)return 'Strong wind';
 return 'No weather flag';
}
