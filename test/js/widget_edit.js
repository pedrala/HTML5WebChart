	var isQueDrawing = false;
	var create_canvas = false;
	var Lcolor="#ff0000";
	var canvasId,line_num_h;
	var dirRad = 0;
	var speedX = 0;
	var speedY = 0;
	var isMoving = false;
	var Mod=false;
	var dLine=false;
	var timer = 0;
	var line_uid=[];
	var line_num=-1
	var clickcnt=0;
	var CDnum=0 ,CD,DrawType,CDMnum,MLine,lXY,lXYm,lXYd;
	var mtype='C';
	var start_canvas=false;
	var trendline;
	var hrx=0,hry=0;
	var crossPt = new Point(0,0);
	var headPt  = new Point(0,0);
	var tailPt  = new Point(0,0);
	var DEG = 180/Math.PI;
	var text_val,txtX=0,txtY=0;
	var drawTextSubmit=false;
	var widgetMouse = false;

	function windowToCanvas(canvas, x, y) {
		var bbox = canvas.getBoundingClientRect();

		return { x: x - bbox.left * (canvas.width  / bbox.width),
				y: y - bbox.top  * (canvas.height / bbox.height)
			  };
	}

	function Point(x, y) {
		this.x = x;
		this.y = y;

		Point.prototype.set=function(x,y){
			this.x = x;
			this.y = y;
		}

		Point.prototype.copy=function(p){
			return new Point(p.x, p.y);
		}

		Point.prototype.sub=function(p){
			return new Point(this.x-p.x,this.y-p.y);
		}

		Point.prototype.length=function(){
			return Math.sqrt(this.x*this.x+this.y*this.y);
		}
	};

	function cDrawLine(tg) {
		
		trendline = tg;
		
		if(trendline =='z') return;

		line_num++;
		console.log("여기:"+trendline+":"+line_num);
		//if(line_num==0){
		if(widgetMouse==false){
			start_canvas=true;
			create_canvas=true;
			isMoving = false;
			widgetMouse=true;
			CD = "<canvas id='canvas1' width="+(eval(this.canvasWidth)-140)+" height="+(eval(this.canvasHeight)-80)+"  class='canvasWidgetCss'></canvas>";
			$('#canvasDiv2').append(CD);

			canvas = document.getElementById("canvas1");
			ctx = canvas.getContext("2d");
			ctx.globalCompositeOperation = "darker",
			//ctx.globalAlpha=0.2;
			
			canvas.addEventListener("mousedown",onMouseDown,true);
			canvas.addEventListener("mousemove",onMouseMove,true);
			canvas.addEventListener("mouseup"  ,onMouseUp,true);
			canvas.addEventListener("click", onClick, false);
			start_canvas=true;
			create_canvas=true;
			ctx.beginPath();

			document.getElementById("btnDLine").disabled =false;

		}else{
			start_canvas=true;
			create_canvas=true;
			isMoving = false;
			widgetMouse=true;
			ctx.beginPath();
		}

		crossPt.x = 0;
		crossPt.y = 0;

		if(Mod==true && dLine==true){
			Mod=false;
			mtype="C";
		}

		if(trendline=='l'){
			this.font = '14px sans-serif';
			this.fillStyle = Lcolor;
			this.hasInput = false;
			txtX=0;
			txtY=0;
		}
	};

	function onMouseDown(e){
		if(widgetMouse==false)return;
		if(trendline=='z'){
			var delNum = -1;
			var canvasX = e.pageX - this.offsetLeft;
			var canvasY = e.pageY - this.offsetTop;
			tailPt.set(canvasX,canvasY);
			console.log("Z1:====>"+canvasX+":"+canvasY);
			console.log("Z2:====>"+ctx.isPointInPath(canvasX, canvasY));
			var isPoint = ctx.isPointInPath(canvasX, canvasY);

			for(var z=0; z<=line_num;z++){
				zlXY = line_uid[z].split("|");
				if(zlXY[6]=="e") isPoint =true;

				if(isPoint) {
					console.log("totle:"+line_num+"====>"+tailPt.x+":"+tailPt.y+"====="+canvasX+":"+canvasY);
					console.log("line_uid["+z+"]:"+line_uid[z]+"======>"+zlXY[6]);
					switch (zlXY[6])
					{
						case "a" :
							if((canvasX> eval(zlXY[1]) && canvasX < eval(zlXY[3])) && (canvasY> eval(zlXY[2]) && canvasY < eval(zlXY[4]))){
								delNum = zlXY[0];
								console.log("직선삭제");
							}
							break;
						case "b" :
							console.log("수평");
							if(canvasY == eval(zlXY[2])){
								delNum = zlXY[0];
								console.log("수평삭제");
							}
							break;
						case "c" :
							console.log("수직");
							if(canvasX == eval(zlXY[1])){
								delNum = zlXY[0];
								console.log("수직삭제");
							}
							break;
						case "d" :
							console.log("십자");
							if(canvasX == eval(zlXY[3]) || canvasY == eval(zlXY[4])){
								delNum = zlXY[0];
								console.log("십자삭제");
							}
							break;
						case "e" :
							console.log("사각");
							if( ((canvasY > eval(lXY[2])-2 && canvasY < eval(lXY[2])+2) && (canvasX > eval(lXY[1]) && canvasX < eval(lXY[1])+eval(lXY[3]))) //) { 
								|| (canvasY == (eval(lXY[2])+eval(lXY[4])) && (canvasX > eval(lXY[1]) && canvasX < (eval(lXY[1])+eval(lXY[3])))) 
								|| (canvasX == eval(lXY[1]) && (canvasY > eval(lXY[2]) && canvasX < (eval(lXY[2])+eval(lXY[4])))) 
								|| (canvasX == (eval(lXY[1])+eval(lXY[3])) && (canvasY > eval(lXY[2]) && canvasY < (eval(lXY[2])+eval(lXY[4])))) ){
									delNum = zlXY[0];
									console.log("사각삭제");
							}
							break;
						case "f" :
							console.log("원");

							break;
						case "g" :
							break;
						case "h" :
							break;
						case "i" :
							break;
						case "j" :
							break;
						case "k" :
							break;
						case "l" :
							console.log("Text");
							if((canvasX > eval(zlXY[1]) && canvasX < eval(zlXY[3])) && (canvasY > eval(zlXY[2]) && canvasY < eval(zlXY[2])+10)){
								delNum = zlXY[0];
								console.log("Text삭제==>"+delNum);
							}else{
								console.log(canvasX +"==>"+ eval(zlXY[1])+":"+eval(zlXY[3])+"======="+canvasY +"==>"+ eval(zlXY[2])+":"+(eval(zlXY[2])+10));
							}
							break;
					}
					
					if(delNum)break;
				}else{
					console.log("영역이 아님:"+ctx.isPointInPath(canvasX, canvasY));
				}
			}

			if(eval(delNum)>-1){
				//line_num
				for(var z1=0,z2=-1; z1 <=line_num; z1++){
					
					if(line_num !=delNum){
						z2++;
						line_uid[z2] = line_uid[z1];
					}
					
					if(z2 == -1){
						line_num =-1;
						trendline = "";
						isQueDrawing = false;
						create_canvas = false;
						isMoving = false;
						Mod=false;
						dLine=false;
						mtype='C';
						start_canvas=false;
						$('#canvasDiv').empty();


					}
					console.log("삭제 후 :"+line_uid[z2]);
				}
			}
		}else{
			if(start_canvas==true ){
				isMoving = false;
				clearInterval(timer);

				if(crossPt.x != 0 && crossPt.y != 0 && isQueDrawing) {
					console.log("AAAAA===>");
					isQueDrawing = false;
					isMoving = true;
					findHeading();
					setHeading();
					//timer = setInterval("gameLoop()", 10);
					if(create_canvas==false){
						line_num_h = MLine;
						lXY = line_uid[MLine].split("|");

						if(trendline=='a'){
							if(mtype=="LS") line_uid[line_num_h] = line_num_h+"|"+tailPt.x+"|"+tailPt.y+"|"+lXY[3]+"|"+lXY[4]+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
							else if(mtype=="LE") line_uid[line_num_h] = line_num_h+"|"+lXY[1]+"|"+lXY[2]+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
							else if(mtype=="LM"){
								if(eval(lXYd[2])<eval(lXYd[4])){
									var moveX= eval(lXYd[1])-tailPt.x-5;
									var moveY= eval(lXYd[2])-tailPt.y-5;	
									var moveXM= Math.abs(eval(lXYd[1])-eval(lXYd[3]))/2;
									var moveYM= Math.abs(eval(lXYd[2])-eval(lXYd[4]))/2;
									line_uid[line_num_h] = line_num_h+"|"+(eval(lXYd[1])-moveX-moveXM)+"|"+(eval(lXYd[2])-moveY-moveYM)+"|"+(eval(lXYd[3])-moveX-moveXM)+"|"+(eval(lXYd[4])-moveY-moveYM)+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
								}else{
									var moveX= eval(lXYd[1])-tailPt.x-5;
									var moveY= eval(lXYd[2])-tailPt.y-5;	
									var moveXM= Math.abs(eval(lXYd[1])-eval(lXYd[3]))/2;
									var moveYM= Math.abs(eval(lXYd[4])-eval(lXYd[2]))/2;
									line_uid[line_num_h] = line_num_h+"|"+(eval(lXYd[1])-moveX-moveXM)+"|"+(eval(lXYd[2])-moveY+moveYM)+"|"+(eval(lXYd[3])-moveX-moveXM)+"|"+(eval(lXYd[4])-moveY+moveYM)+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
								}
							}
						}else if(trendline =='b'){
							line_uid[line_num_h] = line_num+"|0|"+tailPt.y+"|"+ctx.canvas.width+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='c'){
							line_uid[line_num_h] = line_num+"|"+tailPt.x+"|0|"+tailPt.x+"|"+ctx.canvas.height+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='c'){
							line_uid[line_num_h] = line_num+"|"+tailPt.x+"|0|"+tailPt.x+"|"+ctx.canvas.height+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='d'){
							line_uid[line_num_h] = line_num+"|"+ctx.canvas.width+"|"+ctx.canvas.height+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='e'){
							if(mtype=="LS1"){
								var crx1 = tailPt.x;
								var cry1 = tailPt.y;
								var crx2 = (eval(lXYd[1])-tailPt.x) + eval(lXYd[3]);
								var cry2 = (eval(lXYd[2])-tailPt.y) + eval(lXYd[4]);
							}else if(mtype=="LS2"){
								var crx1 = eval(lXYd[1]);
								var cry1 = eval(lXYd[2])+eval(lXYd[4]);
								var crx2 = tailPt.x-crx1;
								var cry2 = tailPt.y-cry1;
							}else if(mtype=="LE1"){
								var crx1 = eval(lXYd[1])+eval(lXYd[3]);
								var cry1 = eval(lXYd[2]);
								var crx2 = tailPt.x-crx1;
								var cry2 = tailPt.y-cry1;
							}else if(mtype=="LE2"){
								var crx1 = eval(lXYd[1]);
								var cry1 = eval(lXYd[2]);
								var crx2 = tailPt.x-crx1;
								var cry2 = tailPt.y-cry1;
							}else if(mtype=="LML"){
								var crx1 = eval(lXYd[1])+eval(lXYd[3]);
								var cry1 = eval(lXYd[2]);
								var crx2 = tailPt.x-crx1;
								var cry2 = eval(lXYd[4]);
							}else if(mtype=="LMR"){
								var crx1 = eval(lXYd[1]);
								var cry1 = eval(lXYd[2]);
								var crx2 = tailPt.x-crx1;
								var cry2 = eval(lXYd[4]);
							}else if(mtype=="LMT"){
								var crx1 = eval(lXYd[1])+eval(lXYd[3]);
								var cry1 = eval(lXYd[2])+eval(lXYd[4]);
								var crx2 = eval(lXYd[1])-crx1;
								var cry2 = tailPt.y-cry1;
							}else if(mtype=="LMB"){
								var crx1 = eval(lXYd[1]);
								var cry1 = eval(lXYd[2]);
								var crx2 = eval(lXYd[3]);
								var cry2 = tailPt.y-cry1;
							}else if(mtype=="LMC"){
								var crxc = Math.abs(eval(lXYd[1])-eval(lXYd[3]));
								var cryc = Math.abs(eval(lXYd[2])-eval(lXYd[4]));
								var crx1 = Math.abs(tailPt.x-crxc); //headPt.x;
								var cry1 = Math.abs(tailPt.y-cryc); //headPt.y;
								var crx2 = Math.abs(eval(lXYd[3])) //tailPt.x-headPt.x;
								var cry2 = Math.abs(eval(lXYd[4])); //tailPt.y-headPt.y;
							}else{
							//	line_uid[line_num_h] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+(tailPt.x-headPt.x)+"|"+(tailPt.y-headPt.y)+"|"+line_num_h+"|"+lXY[6];
							}

							line_uid[line_num_h] = line_num+"|"+crx1+"|"+ cry1+"|"+ crx2+"|"+ cry2+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='f'){
							var crxc = Math.abs(eval(lXYd[3])-eval(lXYd[1]));  // 원의 지름 X
							var cryc = Math.abs(eval(lXYd[4])-eval(lXYd[2]));  // 원의 지름 Y

							if(tailPt.x < eval(lXYd[1])+((eval(lXYd[3])-eval(lXYd[1]))/2)){
								if(tailPt.y < eval(lXYd[2])+((eval(lXYd[4])-eval(lXYd[2]))/2)){
									if(hrx ==0){
										hrx  = Math.abs(tailPt.x+crxc);
										hry  = Math.abs(tailPt.y+cryc);
									}

									var crx  = Math.abs(tailPt.x-eval(hrx));
									var cry  = Math.abs(tailPt.y-eval(hry));
									
									console.log("line_num_hA:"+line_uid[line_num_h]);
									line_uid[line_num_h] = line_num+"|"+tailPt.x+"|"+tailPt.y+"|"+hrx+"|"+hry+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
								}else{
									if(hrx ==0){
										hrx  = Math.abs(tailPt.x+crxc);
										hry  = Math.abs(tailPt.y-cryc);
									}

									var crx  = Math.abs(tailPt.x-eval(hrx));
									var cry  = Math.abs(tailPt.y-eval(hry));
									line_uid[line_num_h] = line_num+"|"+tailPt.x+"|"+hry+"|"+hrx+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
								}
							}else{
								if(hrx ==0){
									hrx  = Math.abs(tailPt.x-crxc);
									hry  = Math.abs(tailPt.y-cryc);
								}
								var crx  = Math.abs(tailPt.x-hrx);
								var cry  = Math.abs(tailPt.y-hry);
								console.log("mod:"+lXYd[1]+":"+lXYd[2]+":"+lXYd[3]+":"+lXYd[4]);
								console.log("mod:"+hrx+":"+hry+":tailPt.x:"+tailPt.x+"===>crx:"+crx+":cry:"+cry);
								console.log("modB:"+hrx+":"+hry+":"+crxc+":"+cryc+"===>");
								ctx.arc(hrx + crx/2, hry + cry/2, crx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)

								line_uid[line_num_h] = line_num+"|"+hrx+"|"+hry+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
							}

							hrx  =0;
							hry  =0;
							console.log("line_num_h===>"+line_uid[line_num_h]);
						}else if(trendline =='i' || trendline =='j'){
							line_uid[line_num_h] = line_num+"|"+tailPt.x+"|"+tailPt.y+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='k'){
							line_uid[line_num_h] = line_num+"|"+lXY[1]+"|"+lXY[2]+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num_h+"|"+lXY[6]+"|"+lXY[7]+"|"+lXY[8];
						}else if(trendline =='l'){
							line_uid[line_num_h] = line_num_h+"|"+tailPt.x+"|"+tailPt.y+"|"+Math.round(eval(tailPt.x)+(eval(keyNum)*5.5)-5)+"|10|"+line_num_h+"|"+trendline+"|"+lXY[7]+"|"+lXY[8];
							console.log('여기 저장:'+line_uid[line_num_h]);
						}
					}else{
						if(trendline=='a'){ 
							if(headPt.x<=tailPt.x){
								line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
							}else{
								line_uid[line_num] = line_num+"|"+tailPt.x+"|"+tailPt.y+"|"+headPt.x+"|"+headPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
							}
						}else if(trendline =='b'){
							line_uid[line_num] = line_num+"|0|"+tailPt.y+"|"+ctx.canvas.width+"|"+tailPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='c'){
							line_uid[line_num] = line_num+"|"+tailPt.x+"|0|"+tailPt.x+"|"+ctx.canvas.height+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='d'){
							line_uid[line_num] = line_num+"|"+ctx.canvas.width+"|"+ctx.canvas.height+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='e'){
							line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+(tailPt.x-headPt.x)+"|"+(tailPt.y-headPt.y)+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='f'){
							line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='i' || trendline =='j'){
							line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+headPt.x+"|"+headPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}else if(trendline =='k'){
							line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+tailPt.x+"|"+tailPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
						}

						console.log("start_canvas==New===>"+line_num+"======"+line_uid[line_num]);
						create_canvas=false;
					}
					
					start_canvas=false;
					return;
				}

				var canvasX = e.pageX - this.offsetLeft;
				var canvasY = e.pageY - this.offsetTop;
				crossPt.set(canvasX,canvasY);
				headPt.set(canvasX,canvasY);

				if((trendline =='i' || trendline =='j') && DrawType !="LM"){ //화살표 그리기
					drawLine();
					line_uid[line_num] = line_num+"|"+headPt.x+"|"+headPt.y+"|"+headPt.x+"|"+headPt.y+"|"+line_num+"|"+trendline+"||"+Lcolor;
					create_canvas = false;
					start_canvas  = false;
				}else if(trendline=='l' && DrawType !="LM"){
					if (hasInput) return;

					if(txtX==0){
						txtX=headPt.x;
						txtY=headPt.y;
					}
					
					addInput(txtX, txtY,Lcolor);
					create_canvas = false;
				}else{
					drawCross();
				}
				console.log("onMouseDown_A");
			}else{
				console.log("onMouseDown_B");
				if(DrawType=="LM"){
					ctx.beginPath();
					CDMnum = lXY[0];
					drawLineH(lXY[1],lXY[2],lXY[3],lXY[4],lXY[6],lXY[7],lXY[8])
					isMoving = false;
					start_canvas=true;
				}
				var canvasX = e.pageX - this.offsetLeft;
				var canvasY = e.pageY - this.offsetTop;
				
				if(line_num_h)canvasId = line_num_h;
				else canvasId=1;
				
				ctx.beginPath();
				ctx.fillStyle = "transparent";
				ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
				
				for(var b=0; b<=line_num;b++){
					console.log("C1===>"+line_num+"==>"+line_uid[b]);
					lXY = line_uid[b].split("|");
		
					if(lXY[6] =='d'){
						var lineRect = defineLineAsRect(eval(lXY[3])-10 ,eval(lXY[4])-10 ,eval(lXY[3])+10 ,eval(lXY[4])+10 , 20);
					}else{
						var lineRect = defineLineAsRect(lXY[1] ,lXY[2] ,lXY[3] ,lXY[4] , 20);
					}

					drawLineH(lXY[1] ,lXY[2] ,lXY[3] ,lXY[4],lXY[6],lXY[7],lXY[8] );
					drawLineAsRect(lineRect, "transparent",lXY[6]);//"transparent");

					if(ctx.isPointInPath(canvasX, canvasY)) {
							console.log(canvasX+":"+canvasY);
						if(lXY[6] =='e'){
							document.getElementById("CX1").value = canvasX;
							document.getElementById("CY1").value = canvasY;
							document.getElementById("TX1").value = eval(lXY[1]);
							document.getElementById("TY1").value = eval(lXY[2]);
							document.getElementById("TX2").value = eval(lXY[3]);
							document.getElementById("TY2").value = eval(lXY[4]);

							if((canvasX> eval(lXY[1])-2 && canvasX < eval(lXY[1])+2) && (canvasY> eval(lXY[2])-2 && canvasY < eval(lXY[2])+2)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LS1'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("MouseDown==>LS1===>"+MLine);
							}else if((canvasX> eval(lXY[1])+eval(lXY[3])-2 && canvasX < eval(lXY[1])+eval(lXY[3])+2) && (canvasY> eval(lXY[2])-2 && canvasY < eval(lXY[2])+2)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LS2'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("MouseDown==>LS2===>"+MLine);
							}else if((canvasX> eval(lXY[1])-2 && canvasX < eval(lXY[2])+eval(lXY[4])+2) && (canvasY> eval(lXY[1])-5 && canvasY < eval(lXY[2])+eval(lXY[4])+2)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LE1'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("MouseDown==>LE1===>"+MLine);
							}else if((canvasX> eval(lXY[1])+eval(lXY[3])-2 && canvasX < eval(lXY[1])+eval(lXY[3])+2) && (canvasY> eval(lXY[2])+eval(lXY[4])-2 && canvasY < eval(lXY[2])+eval(lXY[4])+2)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LE2'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("MouseDown==>LE2===>"+MLine);
							}else{
								if(canvasX > eval(lXY[1])-12 &&canvasX <eval(lXY[1])+12){
									console.log("MouseDown==>LML======>"+canvasX+"|"+canvasY);
									mtype = 'LML'
								}else if(canvasY > eval(lXY[2])-12 && canvasY < eval(lXY[2])+12 ){
									console.log("MouseDown==>LMT======>"+canvasX+"|"+canvasY);
									mtype = 'LMT'
								}else if(canvasX > eval(lXY[1])+eval(lXY[3])-12 && canvasX < eval(lXY[1])+eval(lXY[3])+12){
									console.log("MouseDown==>LMR======>"+canvasX+"|"+canvasY);
									mtype = 'LMR'
								}else if(canvasY > eval(lXY[2])+eval(lXY[4])-12 && canvasY < eval(lXY[2])+eval(lXY[4])+12){
									console.log("MouseDown==>LMB======>"+canvasX+"|"+canvasY);
									mtype = 'LMB'
								}else{
									console.log("MouseDown==>LMC======>"+canvasX+"|"+canvasY);
									mtype = 'LMC'
								}
								DrawType="LM"; //중간 부분
								Mod=true;
								
								MLine=lXY[0];
								trendline = lXY[6];
							//	console.log("MouseDown==>LM======>"+canvasX+"|"+canvasY);
							}
						}else if(lXY[6] =='f'){
								DrawType="LM"; //중간 부분
								Mod=true;
								mtype = 'LM'
								MLine=lXY[0];
								trendline = lXY[6];
						}else if(lXY[6] =='i' || lXY[6] =='j'){
								DrawType="LM"; //중간 부분
								Mod=true;
								mtype = 'LM'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("화살표 이동=====>"+canvasX+"|"+canvasY);
								start_canvas  = true;
						}else if(lXY[6] =='k'){
							if((canvasX> eval(lXY[1])-5 && canvasX < eval(lXY[1])+5) && (canvasY> eval(lXY[2])-5 && canvasY < eval(lXY[2])+5)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LS'
								MLine=lXY[0];
								trendline = lXY[6];

							}else if((canvasX> eval(lXY[3])-5 && canvasX < eval(lXY[3])+5) && (canvasY> eval(lXY[4])-5 && canvasY < eval(lXY[4])+5)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LL'
								MLine=lXY[0];
								trendline = lXY[6];
							}else if((canvasX< eval(lXY[3])-5 && canvasX > eval(lXY[3])+5) && (canvasY< eval(lXY[4])-5 && canvasY > eval(lXY[4])+5)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LR'
								MLine=lXY[0];
								trendline = lXY[6];
							}else{
								DrawType="LM"; //중간 부분
								Mod=true;
								mtype = 'LM'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("이동=====>"+canvasX+"|"+canvasY);
							}
						}else if(lXY[6] =='l'){
							console.log('Text 찾기==>'+canvasX+'=='+lXY[1]+':'+lXY[3]+'==>'+canvasY+'=='+lXY[2]+':'+lXY[4]);
							if((canvasX> eval(lXY[1]) && canvasX < eval(lXY[3])) && (canvasY> eval(lXY[2]) && canvasY < eval(lXY[2]+10))){
								DrawType="LM"; //선 끝 부분
								Mod       = true;
								mtype     = 'LT'
								MLine     = lXY[0];
								trendline = lXY[6];
								text_val  = lXY[7];
								LHC       = lXY[8];
								
								console.log('Text 이동');

							}
						}else{
							if((canvasX> eval(lXY[1])-10 && canvasX < eval(lXY[1])+10) && (canvasY> eval(lXY[2])-10 && canvasY < eval(lXY[2])+10)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LS'
								MLine=lXY[0];
								trendline = lXY[6];

							}else if((canvasX> eval(lXY[3])-10 && canvasX < eval(lXY[3])+10) && (canvasY> eval(lXY[4])-10 && canvasY < eval(lXY[4])+10)){
								DrawType="LM"; //선 끝 부분
								Mod=true;
								mtype = 'LE'
								MLine=lXY[0];
								trendline = lXY[6];
							}else{
								DrawType="LM"; //중간 부분
								Mod=true;
								mtype = 'LM'
								MLine=lXY[0];
								trendline = lXY[6];
								console.log("이동=====>"+canvasX+"|"+canvasY);
							}
						}
					}else{
						widgetMouse=false;
						console.log('Mouse Widget STOP');
		
						widgetDraw(line_uid[line_num]);
						//parent.Chart.Draw();
						
						// mainConvas.addEventListener("mousedown",onMouseDown,true);
						// mainConvas.addEventListener("mousemove",onMouseMove,true);
						// mainConvas.addEventListener("mouseup"  ,onMouseUp,true);
						//canvas.addEventListener("click", onClick, false);
					//	mainConvas.onmousedown = OnHTMLChartCanvasMouseDown;
					//	mainConvas.onmousemove = OnHTMLChartCanvasMouseMove;
					//	mainConvas.onmouseup = OnHTMLChartCanvasMouseUp;

						
					}
				}
			}
		}
	}

	function onMouseMove(e) {
		console.log('widget_mouse_move');
		if(widgetMouse==false)return;
		//console.log("onMouseMove trendline:"+trendline+"==DrawType:"+DrawType);
		if(isMoving || (crossPt.x==0 && crossPt.y==0) || (trendline=='l' && mtype !="LT") || trendline=='z'){
			console.log("onMouseMove Stop:"+trendline);
			var loc = windowToCanvas(canvas, e.clientX, e.clientY);
		//	document.getElementById("info").value = "x: " + loc.x.toFixed(0) + ", y: " + loc.y.toFixed(0);
			return; 
		}

		console.log("onMouseMove Start====line_num:"+line_num);
		isQueDrawing = true;

		var canvasX = e.pageX - this.offsetLeft;
		var canvasY = e.pageY - this.offsetTop;

		tailPt.set(canvasX,canvasY);

		ctx.fillStyle = "transparent";
		ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
		ctx.fill();
		//ctx.beginPath();
		if(DrawType=="LM") {
			DrawType="STOP";
		}

		for(var a=0; a<eval(line_num);a++){
			lXY = line_uid[a].split("|");

			if(a == MLine && Mod==true){
				lXY = line_uid[line_num].split("|");
				drawLineH(lXY[1] ,lXY[2] ,lXY[3] ,lXY[4] ,lXY[6],lXY[7],lXY[8]);
			}else{
				drawLineH(lXY[1] ,lXY[2] ,lXY[3] ,lXY[4] ,lXY[6],lXY[7],lXY[8]);
			}
		}

		if(trendline=='l'){
			console.log('onMouseMove OK')
			drawTextMove();
		}else{
			//findHeading();
			//displayHeading();
			//drawCross();
			drawLine();
		}
	}
	
	function onMouseUp(e){
		clearInterval(timer);
	}

	function drawLineAsRect(lineAsRect, color,tl) {

		console.log("drawLineAsRect Start:"+tl);
		var r = lineAsRect;
		ctx.save();
		ctx.beginPath();

		if(tl=='e'){

		}else if(tl=='f'){

			ctx.lineWidth = 5;
			var rx = Math.abs(eval(r.translateX2)-eval(r.translateX));
			var ry = Math.abs(eval(r.translateY2)-eval(r.translateY));
			
			ctx.arc(eval(r.translateX) + rx/2,eval(r.translateY) + ry/2, rx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
			//ctx.fillStyle = color;
			ctx.strokeStyle = color;
			//ctx.fill();
		}else if(tl=='i'){
			ctx.moveTo(eval(r.translateX), eval(r.translateY)); //패스 시작점 지정  
			ctx.lineTo(eval(r.translateX)-5, eval(r.translateY)+10); //패스 이동점 지정
			ctx.lineTo(eval(r.translateX)+5, eval(r.translateY)+10);  
			ctx.lineTo(eval(r.translateX), eval(r.translateY)); 
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
		}else if(tl=='j'){
			ctx.moveTo(eval(r.translateX), eval(r.translateY)); //패스 시작점 지정  
			ctx.lineTo(eval(r.translateX)-5, eval(r.translateY)-10); //패스 이동점 지정
			ctx.lineTo(eval(r.translateX)+5, eval(r.translateY)-10);  
			ctx.lineTo(eval(r.translateX), eval(r.translateY)); 
			ctx.fillStyle = color;;
			ctx.strokeStyle = color;
			ctx.fill();
		}else if(tl=='k'){
			ctx.lineWidth = 5;
			ctx.moveTo(r.translateX,r.translateY);
			ctx.lineTo(r.translateX2,r.translateY2);

			if(eval(r.translateX)<eval(r.translateX2)){
				ctx.lineTo(eval(r.translateX2)-Math.abs(eval(r.translateX2)-eval(r.translateX))*2,r.translateY2);
				console.log("A:"+r.translateX+"<"+r.translateX2);
			}else{
				ctx.lineTo(eval(r.translateX2)+Math.abs(eval(r.translateX2)-eval(r.translateX))*2,r.translateY2);
				console.log("B:"+r.translateX+">"+r.translateX2);
			}

			ctx.strokeStyle = color;
			ctx.closePath();
		}else if(tl=='l'){
			
			var r = lineAsRect;
			ctx.save();
			ctx.beginPath();
			ctx.rect(r.translateX, r.translateY,eval(r.translateX2)-eval(r.translateX) , 15);
			//console.log("===>"+r.rectX+":"+r.rectY+":"+(eval(r.translateX2)-eval(r.translateX));
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
			
		}else{
			var r = lineAsRect;
			ctx.save();
			ctx.beginPath();
			ctx.translate(r.translateX, r.translateY);
			ctx.rotate(r.rotation);
			ctx.rect(r.rectX, r.rectY, r.rectWidth, r.rectHeight);
			ctx.translate(-r.translateX, -r.translateY);
			ctx.rotate(-r.rotation);
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.fill();
			//ctx.stroke();
			//ctx.restore();
		}
		
		ctx.stroke();
		ctx.restore();
	}

	function defineLineAsRect(x1, y1, x2, y2, lineWidth) {
		var dx = x2 - x1; // deltaX used in length and angle calculations 
		var dy = y2 - y1; // deltaY used in length and angle calculations
		var lineLength = Math.sqrt(dx * dx + dy * dy);
		var lineRadianAngle = Math.atan2(dy, dx);

		return ({
			translateX : x1,
			translateY : y1,
			translateX2: x2,
			translateY2: y2,
			rotation   : lineRadianAngle,
			rectX      : 0,
			rectY      : -lineWidth / 2,
			rectWidth  : lineLength,
			rectHeight : lineWidth
		});
	}

	function drawLine() {
		//console.log("drawLine Start:"+trendline);
		ctx.beginPath();
		ctx.lineWidth = 0.5;
		ctx.strokeStyle = Lcolor;
		ctx.fillStyle   = Lcolor;
		ctx.strokeStyle = Lcolor;

		if(MLine && Mod==true){
			lXYd = line_uid[MLine].split("|");
			lXYd[0] = eval(lXYd[0]);
			lXYd[1] = eval(lXYd[1]);
			lXYd[2] = eval(lXYd[2]);
			lXYd[3] = eval(lXYd[3]);
			lXYd[4] = eval(lXYd[4]);
			lXYd[5] = eval(lXYd[5]);
			lXYd[8] =      lXYd[8];
			//console.log("drawLine==>+line_uid[MLine]:"+line_uid[MLine]+"===>mtype:"+mtype);
			if(trendline =='a'){
				if(mtype == 'LS'){
					ctx.moveTo(lXYd[3], lXYd[4]);
					ctx.lineTo(tailPt.x, tailPt.y);
				}else if(mtype == 'LE'){
					ctx.moveTo(lXYd[1], lXYd[2]);
					ctx.lineTo(tailPt.x, tailPt.y);
				}else if(mtype == 'LM'){
					if(lXYd[2]>lXYd[4]){
						var moveX= eval(lXYd[1])-tailPt.x-5;
						var moveY= eval(lXYd[2])-tailPt.y-5;	
						var moveXM= Math.abs(eval(lXYd[1])-eval(lXYd[3]))/2;
						var moveYM= Math.abs(eval(lXYd[4])-eval(lXYd[2]))/2;
						ctx.moveTo(eval(lXYd[1])-moveX-moveXM, eval(lXYd[2])-moveY+moveYM);
						ctx.lineTo(eval(lXYd[3])-moveX-moveXM, eval(lXYd[4])-moveY+moveYM);
					}else{
						var moveX= eval(lXYd[1])-tailPt.x-5;
						var moveY= eval(lXYd[2])-tailPt.y-5;	
						var moveXM= Math.abs(eval(lXYd[1])-eval(lXYd[3]))/2;
						var moveYM= Math.abs(eval(lXYd[2])-eval(lXYd[4]))/2;
						ctx.moveTo(eval(lXYd[1])-moveX-moveXM, eval(lXYd[2])-moveY-moveYM);
						ctx.lineTo(eval(lXYd[3])-moveX-moveXM, eval(lXYd[4])-moveY-moveYM);
					}
				}
			}else if(trendline =='b'){
				ctx.moveTo(0,tailPt.y);
				ctx.lineTo(ctx.canvas.width,tailPt.y);
			}else if(trendline =='c'){
				ctx.moveTo(tailPt.x,0);
				ctx.lineTo(tailPt.x,ctx.canvas.height);
			}else if(trendline =='d'){
				ctx.moveTo(0,tailPt.y);
				ctx.lineTo(ctx.canvas.width,tailPt.y);
				ctx.moveTo(tailPt.x,0);
				ctx.lineTo(tailPt.x,ctx.canvas.height);
			}else if(trendline =='e'){
				console.log("mtype:"+mtype);
				if(mtype=="LS1"){
					var crx1 = eval(lXYd[1])+eval(lXYd[3]);
					var cry1 = eval(lXYd[2])+eval(lXYd[4]);
					var crx2 = tailPt.x-crx1;
					var cry2 = tailPt.y-cry1;
				}else if(mtype=="LS2"){
					var crx1 = eval(lXYd[1]);
					var cry1 = eval(lXYd[2])+eval(lXYd[4]);
					var crx2 = tailPt.x-crx1;
					var cry2 = tailPt.y-cry1;
				}else if(mtype=="LE1"){
					var crx1 = eval(lXYd[1])+eval(lXYd[3]);
					var cry1 = eval(lXYd[2]);
					var crx2 = tailPt.x-crx1;
					var cry2 = tailPt.y-cry1;
				}else if(mtype=="LE2"){
					var crx1 = eval(lXYd[1]);
					var cry1 = eval(lXYd[2]);
					var crx2 = tailPt.x-crx1;
					var cry2 = tailPt.y-cry1;
				}else if(mtype=="LML"){
					var crx1 = eval(lXYd[1])+eval(lXYd[3]);
					var cry1 = eval(lXYd[2]);
					var crx2 = tailPt.x-crx1;
					var cry2 = eval(lXYd[4]);
				}else if(mtype=="LMR"){
					var crx1 = eval(lXYd[1]);
					var cry1 = eval(lXYd[2]);
					var crx2 = tailPt.x-crx1;
					var cry2 = eval(lXYd[4]);
				}else if(mtype=="LMT"){
					var crx1 = eval(lXYd[1])+eval(lXYd[3]);
					var cry1 = eval(lXYd[2])+eval(lXYd[4]);
					var crx2 = eval(lXYd[1])-crx1;
					var cry2 = tailPt.y-cry1;
				}else if(mtype=="LMB"){
					var crx1 = eval(lXYd[1]);
					var cry1 = eval(lXYd[2]);
					var crx2 = eval(lXYd[3]);
					var cry2 = tailPt.y-cry1;
				}else{
					var crxc = Math.abs(eval(lXYd[1])-eval(lXYd[3]));
					var cryc = Math.abs(eval(lXYd[2])-eval(lXYd[4]));
					var crx1 = Math.abs(tailPt.x-crxc); //headPt.x;
					var cry1 = Math.abs(tailPt.y-cryc); //headPt.y;
					var crx2 = Math.abs(eval(lXYd[3])); //tailPt.x-headPt.x;
					var cry2 = Math.abs(eval(lXYd[4])); //tailPt.y-headPt.y;
				}

				ctx.rect(crx1,cry1,crx2,cry2); //사각형
			}else if(trendline =='f'){
				var crxc = Math.abs(eval(lXYd[3])-eval(lXYd[1]));  // 원의 지름 X
				var cryc = Math.abs(eval(lXYd[4])-eval(lXYd[2]));  // 원의 지름 Y
				if(tailPt.x < eval(lXYd[1])+((eval(lXYd[3])-eval(lXYd[1]))/2)){
					if(tailPt.y < eval(lXYd[2])+((eval(lXYd[4])-eval(lXYd[2]))/2)){						
						if(hrx ==0){
							hrx  = Math.abs(tailPt.x+crxc);
							hry  = Math.abs(tailPt.y+cryc);
						}

						var crx  = Math.abs(tailPt.x-eval(hrx));
						var cry  = Math.abs(tailPt.y-eval(hry));
						console.log("mod1:"+lXYd[1]+":"+lXYd[2]+":"+lXYd[3]+":"+lXYd[4]);
						ctx.arc(hrx - crx/2, hry - cry/2, crx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
					}else{
						if(hrx ==0){
							hrx  = Math.abs(tailPt.x+crxc);
							hry  = Math.abs(tailPt.y-cryc);
						}

						var crx  = Math.abs(tailPt.x-eval(hrx));
						var cry  = Math.abs(tailPt.y-eval(hry));
						console.log("mod2:"+lXYd[1]+":"+lXYd[2]+":"+lXYd[3]+":"+lXYd[4]);
						ctx.arc(hrx - crx/2, hry + cry/2, crx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
					}
				}else{
					if(hrx ==0){
						hrx  = Math.abs(tailPt.x-crxc);
						hry  = Math.abs(tailPt.y-cryc);
					}
					var crx  = Math.abs(tailPt.x-hrx);
					var cry  = Math.abs(tailPt.y-hry);
					console.log("mod:"+lXYd[1]+":"+lXYd[2]+":"+lXYd[3]+":"+lXYd[4]);
					console.log("mod:"+hrx+":"+hry+":tailPt.x:"+tailPt.x+"===>crx:"+crx+":cry:"+cry);
					console.log("modB:"+hrx+":"+hry+":"+crxc+":"+cryc+"===>");
					//console.log("mod:"+hrx+":"+hry+":"+crx+":"+cry+"===>");
					ctx.arc(hrx + crx/2, hry + cry/2, crx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)

				}
			}else if(trendline =='i'){
				ctx.moveTo(tailPt.x, tailPt.y); //패스 시작점 지정  
				ctx.lineTo(tailPt.x-5, tailPt.y+10); //패스 이동점 지정
				ctx.lineTo(tailPt.x+5, tailPt.y+10);  
				ctx.lineTo(tailPt.x, tailPt.y); 
				ctx.fillStyle = "#0000ff";
				ctx.strokeStyle = "#0000ff";
				console.log("화살표 수정:drawLine===>");
			}else if(trendline =='j'){
				ctx.moveTo(tailPt.x, tailPt.y); //패스 시작점 지정  
				ctx.lineTo(tailPt.x-5, tailPt.y-10); //패스 이동점 지정
				ctx.lineTo(tailPt.x+5, tailPt.y-10);  
				ctx.lineTo(tailPt.x, tailPt.y); 
				ctx.fillStyle = "#ff0000";
				ctx.strokeStyle = "#ff0000";
			}else if(trendline =='k'){
				if(lXYd[1] == tailPt.x && lXYd[2] == tailPt.y){
					ctx.moveTo(lXYd[1],lXYd[2]);
				}else{
					ctx.moveTo(lXYd[1],lXYd[2]);
					ctx.lineTo(tailPt.x,tailPt.y);
					ctx.lineTo(tailPt.x-(tailPt.x-eval(lXYd[1]))*2,tailPt.y);
					ctx.closePath();
				}
			}
		}else{
			if(trendline =='a'){
				ctx.moveTo(headPt.x, headPt.y);
				ctx.lineTo(tailPt.x, tailPt.y);
			}else if(trendline =='b'){
				ctx.moveTo(0,tailPt.y);
				ctx.lineTo(ctx.canvas.width,tailPt.y);
			}else if(trendline =='c'){
				ctx.moveTo(tailPt.x,0);
				ctx.lineTo(tailPt.x,ctx.canvas.height);
			}else if(trendline =='d'){
				ctx.moveTo(0,tailPt.y);
				ctx.lineTo(ctx.canvas.width,tailPt.y);
				ctx.moveTo(tailPt.x,0);
				ctx.lineTo(tailPt.x,ctx.canvas.height);
			}else if(trendline =='e'){
				ctx.rect(headPt.x, headPt.y,tailPt.x-headPt.x, tailPt.y-headPt.y);
			}else if(trendline =='f'){
				var rx = Math.abs(tailPt.x-headPt.x);
				var ry = Math.abs(tailPt.y-headPt.y);
			   
				if(headPt.x > tailPt.x){
					ctx.arc(headPt.x - rx/2, headPt.y - ry/2, rx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
				}else{
					ctx.arc(headPt.x + rx/2, headPt.y + ry/2, rx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
				}
			}else if(trendline =='i'){
				ctx.moveTo(headPt.x, headPt.y); //패스 시작점 지정  
				ctx.lineTo(headPt.x-5, headPt.y+10); //패스 이동점 지정
				ctx.lineTo(headPt.x+5, headPt.y+10);  
				ctx.lineTo(headPt.x, headPt.y); 
				ctx.fillStyle = "#0000ff";
				ctx.strokeStyle = "#0000ff";
				ctx.fill();   //색 채우기
			}else if(trendline =='j'){
				ctx.moveTo(headPt.x, headPt.y); //패스 시작점 지정  
				ctx.lineTo(headPt.x-5, headPt.y-10); //패스 이동점 지정
				ctx.lineTo(headPt.x+5, headPt.y-10);  
				ctx.lineTo(headPt.x, headPt.y); 
				ctx.fillStyle = "#ff0000";
				ctx.strokeStyle = "#ff0000";
				ctx.fill();   //색 채우기
			}else if(trendline =='k'){
				if(headPt.x == tailPt.x && headPt.y == tailPt.y){
					ctx.moveTo(headPt.x,headPt.y);
				}else{
					ctx.moveTo(headPt.x,headPt.y);
					ctx.lineTo(tailPt.x,tailPt.y);
					ctx.lineTo(tailPt.x-(tailPt.x-headPt.x)*2,tailPt.y);
					ctx.closePath();
				}
			}
		}

		ctx.stroke();
		dLine=true;
	}

	function drawLineH(SX,SY,EX,EY,LT,TXT,Hcolor) {
//		console.log("drawLineH Start:"+LT+":Hcolor:"+Hcolor);
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = Hcolor;
		ctx.fillStyle   = Hcolor;

		if(LT =='d'){
			ctx.moveTo(0, EY);
			ctx.lineTo(ctx.canvas.width, EY);
			ctx.moveTo(EX, 0);
			ctx.lineTo(EX, ctx.canvas.height);
		}else if(LT =='e'){
			ctx.rect(SX, SY,EX, EY);
		}else if(LT =='f'){
			var hrx = Math.abs(eval(EX)-eval(SX));
			var hry = Math.abs(eval(EY)-eval(SY));		   
			ctx.arc(eval(SX) + hrx/2, eval(SY) + hry/2, hrx/2, 0, 2*Math.PI);  //원 그리기(360도 호 그리기)
			console.log("drawLine===>"+SX+"|"+SY+"|"+EX+"|"+EY);
		}else if(LT =='i'){
			ctx.moveTo(SX, SY); //패스 시작점 지정  
			ctx.lineTo(eval(SX)-5, eval(SY)+10); //패스 이동점 지정
			ctx.lineTo(eval(SX)+5, eval(SY)+10);  
			ctx.lineTo(SX, SY); 
			ctx.fillStyle = "#0000ff";
			ctx.strokeStyle = "#0000ff";
			ctx.fill();   //색 채우기
		}else if(LT =='j'){
			ctx.moveTo(SX, SY); //패스 시작점 지정  
			ctx.lineTo(eval(SX)-5, eval(SY)-10); //패스 이동점 지정
			ctx.lineTo(eval(SX)+5, eval(SY)-10);  
			ctx.lineTo(SX, SY); 
			ctx.fillStyle = "#ff0000";
			ctx.strokeStyle = "#ff0000";
			ctx.fill();   //색 채우기
		}else if(LT =='k'){
			ctx.moveTo(SX,SY);
			ctx.lineTo(EX,EY);
			ctx.lineTo(eval(EX)-(eval(EX)-eval(SX))*2,eval(EY));
			ctx.closePath();
		}else if(LT =='l'){
			if(drawTextSubmit==true){
				//console.log("drawLineH:"+TXT+"=="+SX+"=="+SY);
				drawText(TXT, SX, SY,Hcolor)
			}
		}else{
			ctx.moveTo(SX, SY);
			ctx.lineTo(EX, EY);
		}

		ctx.stroke();
	}

    function findHeading() {
        var dot = (headPt.x-tailPt.x)*1 + (headPt.y-tailPt.y)*0;
        var line = headPt.sub(tailPt);
        var len = line.length();
        var cosVal = dot/len;
        var rad = Math.acos(cosVal);
        var deg = rad * (180/Math.PI);

        /*
          Javascript의 수학 라이브러리는 Math.acos()의 경우 그 리턴 값이 0~180 deg 이므로 우측에서 시작하여
          180도까지는 실제 각도와 일치하지만 180도를 넘어선 각도는 원점에서 반시계 방향으로 증가하는 수로 리턴하는 특징을 가진다.
          그러므로 어떤 벡터가 가리키는 방향이 위쪽이라면 아래와 같은 방법을 이용하여 360도 체제로 변환할 필요가 있다 
        */

        if(line.y<0) {//타겟이 위쪽에 있는 경우에는 각도를 보정해야 한다.
            //deg = 180-deg+180;
            rad = Math.PI - rad + Math.PI;
            deg = rad * 180/Math.PI
        }
        dirRad = rad;
    }

	function setHeading() {
		var cosVal = Math.cos(dirRad);
		var sinVal = Math.sin(dirRad);

		speedX = cosVal;
		speedY = sinVal;
	}

	function gameLoop() {
		ctx.fillStyle = "transparent";
		ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
		ctx.fill();
		ctx.fillStyle = "black";
		displayHeading();
		//drawCross();
		crossPt.x += speedX*5;
		crossPt.y += speedY*5;
		drawLine();
	}

	function drawCross(){
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.moveTo(crossPt.x-5, crossPt.y);
		ctx.lineTo(crossPt.x+5, crossPt.y);
		ctx.moveTo(crossPt.x, crossPt.y-5);
		ctx.lineTo(crossPt.x, crossPt.y+5);
		ctx.stroke();
	}

	function displayHeading() {
		ctx.fillStyle = "black";
		ctx.font = "bold 20px sans-serif";
		//ctx.fillText("Heading:"+Math.round(dirRad*DEG),100,20);
		ctx.fillText("Heading:("+headPt.x+":"+headPt.y+")("+tailPt.x+":"+tailPt.y+")",100,20);

	}

	function onClick(e) {
		var element = canvas;
		var offsetX = 0, offsetY = 0

		if (element.offsetParent) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			} while ((element = element.offsetParent));
		}

		x = e.pageX - offsetX;
		y = e.pageY - offsetY;

		//document.getElementById("info").value = "x: " + x + ", y: " + y;
	}

	function addInput(x, y,Hcolor) {
		this.Tx = x;
		this.Ty = y;
		this.HC = Hcolor;
		this.keyNum =0;
		console.log("addInput Start:"+Tx+":"+Ty);
		var input = document.createElement('input');

		input.type = 'text';
		input.style.position = 'absolute';
		input.style.left = (Tx+66) + 'px';
		input.style.top =  (Ty-4) + 'px';
		input.style.zIndex = 5;
		//input.style.left = x + 'px';
		//input.style.top = y + 'px';

		input.onkeydown = handleEnter;
		
		document.body.appendChild(input);

		input.focus();
		
		hasInput = true;
	}

	function handleEnter(e) {
		var keyCode = e.keyCode;
		
		if (keyCode === 13) {
			drawText(this.value,Tx, Ty,HC);

			console.log(this.value+"====="+Tx);
			document.body.removeChild(this);
			hasInput = false;
			
		}
		keyNum++;

		line_uid[line_num] = line_num+"|"+Tx+"|"+Ty+"|"+Math.round(eval(Tx)+(eval(keyNum)*5.5)-5)+"|10|"+line_num+"|"+trendline+"|"+this.value+"|"+HC;
		hasInput = true;
	}

	function drawText(txt, x, y,LHC) {
		console.log("drawText:"+txt+":"+x+":"+y);
		ctx.textBaseline = 'top';
		ctx.textAlign = 'left';
		ctx.fillStyle = LHC;
		ctx.font = font;
		//console.log(txt.fontsize(font));
		ctx.fillText(txt,eval(x) - 4, eval(y) - 4);
		drawTextSubmit =true;
		//start_canvas=false;
		//line_uid[line_num] = line_num+"|"+x+"|"+y+"|"+(x+(keyNum*5))+"|10|"+line_num+"|"+trendline+"|"+this.value;
		//ctx.fillText(txt, x, y);
		dLine=true;
	}

	function drawTextMove(){
		//tailPt.x,tailPt.y
		console.log("drawTextMove:"+text_val);
		ctx.textBaseline = 'top';
		ctx.textAlign = 'left';
		ctx.fillStyle = LHC;
		ctx.font = font;
		ctx.fillText(text_val, tailPt.x- 4, tailPt.y- 4);
		drawTextSubmit =true;
		start_canvas=true;
	}

	var COLOR_ARRAY = new Array("pink", "red", "orange", "yellow", "green", "blue", "purple", "black", "white");
	function makeColor() {
		var innerHTML = "<div style=\"border:1px\">";
		for (var i=0; i<COLOR_ARRAY.length; i++) {
			innerHTML += "<span style=\"background:"+COLOR_ARRAY[i]+"\" onclick='selectColor(\""+COLOR_ARRAY[i]+"\")'>&nbsp;&nbsp;&nbsp;</span>";
		}
		innerHTML += "</div>";
		document.getElementById("colorDiv").innerHTML = innerHTML;
	}

	function selectColor(color) {
		console.log("[selectColor] color:"+color);
		Lcolor = color;
	}

	function showColor() {
		makeColor();
		if (document.getElementById("colorDiv").style.display == "none") {
			document.getElementById("colorDiv").style.display = "block";
		} else {
			document.getElementById("colorDiv").style.display = "none";
		}
	}
