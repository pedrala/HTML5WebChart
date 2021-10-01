function RealClose(symbol){
	console.log("_______RealClose_______")
//	theApp.qm.unregisterReal('KVS0', [symbol],[theApp.getMainContainer()]);
}

var r_data = [];
r_data[0] = {
	todayTime: "20181221120000",
	execprice: 65000,
	execvalue: 1000000
}
r_data[1] = {
	todayTime: "20181222130001",
	execprice: 65500,
	execvalue: 15
}
r_data[2] = {
	todayTime: "20181223140002",
	execprice: 63500,
	execvalue: 19
}
r_data[3] = {
	todayTime: "20181224150003",
	execprice: 65000,
	execvalue: 6
}
r_data[4] = {
	todayTime: "20181225160004",
	execprice: 66000,
	execvalue: 5
}
r_data[5] = {
	todayTime: "2018122690005",
	execprice: 61000,
	execvalue: 20
}
var execprice = 58500;

function Real(ri){

	/******execprice 난수 만들기  Start*************/
	/* add 사용자정의
	var todayTime = r_data[ri].todayTime;
	execprice = r_data[ri].execprice;
	var execvalue = r_data[ri].execvalue;
	*/

	// 
	/* add 랜덤
	var todayTime = r_data[ri].todayTime;
	execprice += Math.floor((Math.random() - 0.5) / 10 * execprice);
	var execvalue = Math.floor(Math.random()*10000000 + 1);
	// */

	//	/* update
	var todayTime = realtime();
	execprice += Math.floor((Math.random() - 0.5) / 500 * execprice);
	var execvalue = Math.floor(Math.random()*10 + 1);
	// */

	/******execprice 난수 만들기  End  *************/
	var RdataArr = {
		"rd":{
			"symbol":"USA" ,
			"exectime":todayTime ,
			"execprice":execprice ,
			"execvalue":execvalue ,
			"opentime":201711231008 ,
			"hightime":201711231108 ,
			"lowtime":201711231208 ,
			"openprc":352000,
			"highprc":352000 ,
			"lowprc":352000 ,
			"yesterdayprice":0 ,
			"diffdiv":0 ,
			"diff":0 ,
			"sellcumexecqty":0 ,
			"buycumexecqty":0 ,
			"sellcumexeccnt":0 ,
			"buycumexeccnt":0 ,
			"exectype":"" ,
			"execqty":"" ,
			"cumdealqty":"" ,
			"precumdealqty":"" ,
			"cumdealcost":"" ,
			"precumdealcost":"" ,
			"ask":"",
			"bid":"" ,
			"askrest":"" ,
			"bidrest":"" ,
			"asktotal":"" ,
			"bidtotal":"" ,
			"updnrate":"" ,
			"openprcdiff":"" ,
			"openprcdiffupdnrate":"" ,
			"highprcdiff":"" ,
			"highprcdiffupdnrate":"" ,
			"lowprcdiff":"" ,
			"lowprcdiffupdnrate":"" ,
			"dealqtydiff":"" ,
			"dealqtyupdnrate":"" ,
			"dealqtytrate":"" ,
			"dealcostdiff":"" ,
			"dealcostupdnrate":"" ,
			"execstrth":"" ,
			"jstatus":""
		}
	}
	return RdataArr;
}

function realtime(){
		var d = new Date();
		var today = leadingZeros(d.getFullYear(), 4)+
					leadingZeros(d.getMonth()+1,  2)+
					leadingZeros(d.getDate(),     2)+ 
					leadingZeros(d.getHours(),    2)+ 
					leadingZeros(d.getMinutes(),  2)+
					leadingZeros(d.getSeconds(),  2);

		return today;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}


/**********************************************************************
종목코드			symbol				symbol				char	15
체결시간			exectime			exectime			char	12
체결가격			execprice			execprice			char	20
체결금액			execvalue			execvalue			double	20
시가시간			opentime			opentime			char	12
고가시간			hightime			hightime			char	12
저가시간			lowtime				lowtime				char	12
시가				openprc				openprc				double	20
고가				highprc				highprc				double	20
저가				lowprc				lowprc				double	20
전일종가			yesterdayprice		yesterdayprice		double	20
전일대비구분		diffdiv				diffdiv				char	 1
전일대비			diff				diff				double	20
매도누적체결량		sellcumexecqty		sellcumexecqty		double	20
매수누적체결량		buycumexecqty		buycumexecqty		double	20
매도누적체결건수	sellcumexeccnt		sellcumexeccnt		long	15
매수누적체결건수	buycumexeccnt		buycumexeccnt		long	15
체결종류			exectype			exectype			char	 1
체결수량			execqty				execqty				double	20
누적거래량			cumdealqty			cumdealqty			double	20
전일누적거래량		precumdealqty		precumdealqty		double	20
누적거래대금		cumdealcost			cumdealcost			double	20
전일누적거래대금	precumdealcost		precumdealcost		double	20
매도호가			ask					ask					double	20
매수호가			bid					bid					double	20
매도호가잔량		askrest				askrest				double	20
매수호가잔량		bidrest				bidrest				double	20
매도호가총잔량		asktotal			asktotal			double	20
매수호가총잔량		bidtotal			bidtotal			double	20
등락율				updnrate			updnrate			double	 6
시가전일대비		openprcdiff			openprcdiff			double	20
시가전일대비등락율	openprcdiffupdnrate	openprcdiffupdnrate	double	 6
고가전일대비		highprcdiff			highprcdiff			double	20
고가전일대비등락율	highprcdiffupdnrate	highprcdiffupdnrate	double	 6
저가전일대비		lowprcdiff			lowprcdiff			double	20
저가전일대비등락율	lowprcdiffupdnrate	lowprcdiffupdnrate	double	 6
거래량전일대비		dealqtydiff			dealqtydiff			double	20
거래량등락율		dealqtyupdnrate		dealqtyupdnrate		double	 8
거래량회전율		dealqtytrate		dealqtytrate		double	 6
거래대금전일대비	dealcostdiff		dealcostdiff		double	20
거래대금등락율		dealcostupdnrate	dealcostupdnrate	double	10
체결강도			execstrth			execstrth			double	 6
장구분정보			jstatus				jstatus				char	 2
************************************************************************/