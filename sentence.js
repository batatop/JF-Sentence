$(document).ready(function() {
	var input= "abc";
	var answer= "def";
	var splitInput= sentenceSplit();
	var toCompare= [];
	var returnString= "";
	var checked= false;
	var submitReturn= "";
	var wantCheck= "No";
	var leftTag= "abc";
	var rightTag= "def";
	//style
	var fontSize= 20;
	var fontFamily= "Century Gothic";
	var fontColor= "#000000";
	var answerBoxColor= "#FFFACD";
	var dragBoxColor= "#FFFFE0";

	//constructors
	function Box(word, x,y){
		this. word= word;
		this.x= x;
		this.y= y;
	}

	JFCustomWidget.subscribe("ready", function(){
	    input = JFCustomWidget.getWidgetSetting('userSentence');
	    wantCheck= JFCustomWidget.getWidgetSetting('userWantCheck');
	    leftTag= JFCustomWidget.getWidgetSetting('userLeftTag');
	    rightTag= JFCustomWidget.getWidgetSetting('userRightTag');
	    //style
	    fontSize= parseInt(JFCustomWidget.getWidgetSetting('userFontSize'));
	    fontFamily= JFCustomWidget.getWidgetSetting('userFontFamily');
	    fontColor= JFCustomWidget.getWidgetSetting('userFontColor');
	    answerBoxColor= JFCustomWidget.getWidgetSetting('userAnswerBoxColor');
	    dragBoxColor= JFCustomWidget.getWidgetSetting('userdragBoxColor');

	    if(leftTag===undefined){
	    	leftTag="._.";
	    	$("#tagLeft").css("visibility", "hidden");
	    }
	    if(rightTag===undefined){
	    	rightTag="";
	    }

	    if(wantCheck=="No"){
	    	$("#tagLeft").append(leftTag);
	    	$("#tagRight").append(rightTag);
	    }
	    splitInput= sentenceSplit();
		appendBoxes();
		resizeAnswerField();


		$( function() {
			$( ".draggable" ).draggable({
				snap: ".answerBox",
				snapMode: "inner",
				drag: function(){
					var offset= $(this).offset();
					var xPos = offset.left;
		            var yPos = offset.top;
					var boxId= $(this).attr("id").replace("box_","");
					toCompare[boxId].x= xPos;
					toCompare[boxId].y= yPos;
					compareCoordinates();
					//$("#dummy").text(submitReturn);
					//$("#dummy").text(check(returnString));
					checked= check(returnString);
					submitReturn= returnString;
					returnString="";
				}
			});
		} );

        var canWidth= 650;
        var compareWidth=0;
        var heightCounter=1;
        var canHeight= 15+ $(".answerBox").outerHeight() +30;
        for(var i=0; i<sentenceSplit.length; i++){
        	compareWidth+= 20;
        }
        compareWidth+= $(".answerBox").outerWidth();
        while(compareWidth>canWidth){
        	compareWidth-=canWidth;
        	heightCounter++;
        }
        for(var i=0; i<heightCounter; i++){
        	canHeight+= $("#box_0").outerHeight()+20;
        }
        canvasSize= {width: canWidth, height: canHeight};
        JFCustomWidget.requestFrameResize(canvasSize);
	});

	JFCustomWidget.subscribe("submit", function(){
		var result = {};
		if(wantCheck=="Yes"){
            result.valid = true;
            if(checked){
            	result.value= submitReturn+" → Correct";
            }
            else{
            	result.value= submitReturn+" → False";
            }
		}
		else{
			result.valid = true;
			submitReturn= submitReturn.replace(/ /g," → ");
			if(leftTag!=undefined && leftTag!="._." && leftTag!=""){
				submitReturn= "("+ leftTag+ ") "+ submitReturn;
			}
			if(rightTag!=undefined && rightTag!=""){
				submitReturn= submitReturn+ " ("+ rightTag+ ")";
			}
			result.value = submitReturn;
		}
		JFCustomWidget.sendSubmit(result);
    }); 

	//makes boxes draggable
	function check(returnString){
		//turn input
		input= input.replace(/._./g, "")
		input= input.replace(/ /g, "");
		input= input.toLowerCase();
		//turn returnString
		returnString= returnString.replace(/ /g, "");
		returnString= returnString.toLowerCase();
		//compare
		var coorRight= $(".answerBox").offset().left + $(".answerBox").outerWidth();
		var coorBottom= $(".answerBox").offset().top + $(".answerBox").outerHeight();
		var inside= true;
		for(var i=0; i<toCompare.length; i++){
			if(toCompare[i].x<=$(".answerBox").offset().left-1 || toCompare[i].x>=coorRight+1){
				inside= false;
			}
			if(toCompare[i].y<=$(".answerBox").offset().top-1 || toCompare[i].y>=coorBottom+1){
				inside= false;
			}
		}
		if(inside){
			if(input==returnString){
				return true;
			}
			else{
				return false;
			}
		}
		else{
			return false;
		}
	}

	//compares coordinates
	function compareCoordinates(){
		var tempComp= [];
		for(var i=0; i<toCompare.length; i++){
			tempComp[i]= toCompare[i];
		}

		for(var i=0; i<tempComp.length; i++){
			for(var j=0; j<tempComp.length-i-1; j++){
				if(tempComp[j].x> tempComp[j+1].x){
					var temp= tempComp[j];
					tempComp[j]= tempComp[j+1];
					tempComp[j+1]= temp;
				}
			}
		}

		//compare
		var coorRight= $(".answerBox").offset().left + $(".answerBox").outerWidth();
		var coorBottom= $(".answerBox").offset().top + $(".answerBox").outerHeight();
		var inside= true;
		for(var i=0; i<tempComp.length; i++){
			if(tempComp[i].x<=$(".answerBox").offset().left-1 || tempComp[i].x>=coorRight+1){
				//console.log("tempComp["+i+"] is not in the box");
			}
			if(tempComp[i].y<=$(".answerBox").offset().top-1 || tempComp[i].y>=coorBottom+1){
				//console.log("tempComp["+i+"] is not in the box");
			}
			else{
				returnString+= tempComp[i].word+" ";
			}
		}
		if(returnString.endsWith(" ")){
		  returnString = returnString.substring(0,returnString.length-1);
		}
		return returnString;
	}

	//splits the sentence in the correct way, replaces "._."" with " "
	function sentenceSplit(){
		returnInput= input.split(" ");
		for (var i = 0; i < returnInput.length; i++) {
			returnInput[i]= returnInput[i].replace("._.", " ");
		}
		return returnInput;
	}

	//adds word boxes to the html page
	function appendBoxes(){
		for (var i = 0; i < splitInput.length; i++) {
			if(i==0){
				$( ".inputContainer" ).append('<p id= box_'+i+' class="draggable">'+splitInput[i]+'</p>');
				$(".draggable").css({"background-color": dragBoxColor, color: fontColor, "font-size": fontSize+"px", margin: (fontSize/2)+"px", padding: (fontSize/2)+"px", height: (fontSize*(5/4))+"px"});
				toCompare.push(new Box(splitInput[i], $("#box_"+i).offset().left, $("#box_"+i).offset().top));
			}
			else{
				var rand= Math.random();
				if(rand<=0.5){
					$( "#box_0" ).after('<p id= box_'+i+' class="draggable">'+splitInput[i]+'</p>');
					$(".draggable").css({"background-color": dragBoxColor, color: fontColor, "font-size": fontSize+"px", margin: (fontSize/2)+"px", padding: (fontSize/2)+"px", height: (fontSize*(5/4))+"px"});
					toCompare.push(new Box(splitInput[i], $("#box_"+i).offset().left, $("#box_"+i).offset().top));
				}
				else{
					$( "#box_0" ).before('<p id= box_'+i+' class="draggable">'+splitInput[i]+'</p>');
					$(".draggable").css({"background-color": dragBoxColor, color: fontColor, "font-size": fontSize+"px", margin: (fontSize/2)+"px", padding: (fontSize/2)+"px", height: (fontSize*(5/4))+"px"});
					toCompare.push(new Box(splitInput[i], $("#box_"+i).offset().left, $("#box_"+i).offset().top));
				}
			}
		}
	}

	//resizes answer field
	function resizeAnswerField(){
		var boxWidth=0;
		for (var i = 0; i < splitInput.length; i++) {
			boxWidth+= $("#box_"+i).outerWidth();
		}
		$(".answerBox").css({width: boxWidth+"px", "background-color": answerBoxColor, "border-color": fontColor, height: (fontSize*(5/4)+fontSize)+"px", margin: (fontSize/2)+"px"});

		$("#tagRight").css({top: $("#tagLeft").offset.top+"px", left: $(".answerBox").outerWidth()+"px"});
	}
});