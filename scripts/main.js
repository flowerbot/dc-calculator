
var planList;
var devTypes = [];
var defaultCap = 20000;
var loggedInUser;
var data; // in wikiAsVariable.json;

var excludedPlans = [0, 6, 29, 30, 31];

/*
Version history:
0.1 first draft
0.2 adjustments made to handle CP23 'Space' unit and how cap calculations interracted with these
*/

var version = 0.4;
var versionDate = "16/11/2021";
var versionDesc = "converted to non-sp cloud version on github";

var guideState = "showing";
var comGuideState = "show";
var hintState;

var value = 10;

var levyRates = [];
var activeLevyRates = [];

var Overrides = [];
var activeOverrides = [];

var savedText = [];

var planListArray = [];
var calculationData = [];

var reportErrors = true;  //change to false if you don't want code errors from console to pop up on screen
var debug = false;

const letter = (num => { // converts a number to an alpha letter
    return (num+9).toString(36).toLowerCase();
});


Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});


var getNextSibling = function (elem, selector) {

    // Get the next sibling element
    var sibling = elem.nextElementSibling;

    // If the sibling matches our selector, use it
    // If not, jump to the next sibling and continue the loop
    // NB: edge doesn't recognise matches, hence treatment for msmatchesselector
    while (sibling) {
        if(sibling.matches) {
            if (sibling.matches(selector)) return sibling;
            sibling = sibling.nextElementSibling
        } else if(sibling.msMatchesSelector) {
            if (sibling.msMatchesSelector(selector)) return sibling;
            sibling = sibling.nextElementSibling
        }
    }

};

var errCodeArray = [];

window.onerror = function(e, url, line){

 if(reportErrors) {
     // don't really care about intro.js errors
     if(url.indexOf("intro.min.js")<0) {
        myErrorText = "<div>The follow code error occurred, check the console for more info.  This error may or may not be significant.</div><code>" + e.toString() + "</code>" +
                        "<div>At <a href='"+ url+"'>"+url+"</a></div>"+
                        "<div>line: "+line +"</div>";
        console.log(myErrorText);
        // alert(myErrorText);
        Swal.fire({
            icon: "error",
            title: "Code Error",
            html: myErrorText

            }) 
        }
    }
 }

function spSaveBtnState() {

    if(localStorage.getItem("SaveSP"))  {   

        if(localStorage.getItem("SaveSP") == "notchecked")  {
            document.getElementById("chkSaveSP").removeAttribute("checked");
            document.getElementById("chkSaveSP").checked = false;
        }
        //document.getElementById("chkSaveSP").checked = false;
    }
 }

function afterLoad() {

    // what can I replace this with ??  can I reactivate it back in SP?
    //ExecuteOrDelayUntilScriptLoaded(getUser, "sp.js");

    //FIRST GET THE MAIN DATASET OF RATES

	//wikiData = JSON.parse(wikiData);

	//console.log("wikiData:");
	//console.log(wikiData);


	var host = window.location.hostname;
	if(host.indexOf("github")> -1) {

		//fetch
		textfile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/text.json"
		wikifile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/wiki.json"

		//csv parse
		levyfile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/Levy Rates.csv"
		overridesfile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/Overrides.csv"
		planlistfile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/PlanListExported.csv"
		calculationdatafile = "https://raw.githubusercontent.com/flowerbot/dc-calculator/main/data/CalculationData.csv"

	} else {
		textfile = "data/text.json"
		wikifile = "data/wiki.json"
		levyfile = "data/Levy Rates.csv"
		overridesfile = "data/Overrides.csv"
		planlistfile = "data/planListExported.csv"
		calculationdatafile = "data/CalculationData.csv"

	}



    Papa.parse(levyfile, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(parsed){
                

                levyRates = parsed.data;
                console.log("levyRates:");
                console.log(levyRates);



                levyRates.forEach(function(ob) {

                    ob["Applies to"] = ob["Applies to"].split("; ");
					// get rid of comma thousands separator

					var tmpAmount = ob["Amount"].toString();
					ob["Amount"] = parseFloat(tmpAmount.replace(/,/g,''));

                });


                //STEP 2
                Papa.parse(overridesfile, {
                    download: true,
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function(parsed) {

                        Overrides = parsed.data;
                        console.log("Overrides:");
                        console.log(Overrides);


                        //step 3
                     /*   Papa.parse("data/text.csv", {
                        download: true,
                        header: true,
                        skipEmptyLines: true,
                        complete: function(parsed) {

                            savedText = parsed.data;
                            console.log("savedText:");
                            console.log(savedText); */

                            //STEP 4

                            Papa.parse(planlistfile, {
                                download: true,
                                header: true,
                                dynamicTyping: true,
                                skipEmptyLines: true,
                                complete: function(parsed) {

                                    planListArray = parsed.data;
                                    planList = planListArray;
                                    console.log("planList:");
                                    console.log(planList);

								


                                    // STEP 5
                                    Papa.parse(calculationdatafile, {
                                        download: true,
                                        header: true,
                                        skipEmptyLines: true,
                                        complete: function(parsed) {

                                            calculationData = parsed.data;
                                            console.log("calculationData:");
                                            console.log(calculationData);

                                            // now we can list out the rates

                                            //planList = planListArray;  //TODO: FILTER THIS // already got this
           
                                            calcData = calculationData // TODO: FILTER THIS
                                                    //calcData = data2.d.results;
                                                    //  console.log(calcData);
                                                    for (i = 0; i < planList.length; i++) {
                                                        var items = calcData.filter(function(item) {
                                                            return item.PlanNumber == planList[i]['Plan Number'];
                                                        })
                                                        planList[i]["Calcset"] = items;
                                                    }
                                        
                                            getLevyRates(false);  //TODO: THIS PROBABLY IS NOT GOING TO HAPPEN AT THE RIGHT TIME




                                        }
                                        
                                    })

                                }
                                
                           // });  //csv
                       // } // csv
                        
                    });

                    }
                    
                });

            }
        });

		// testurl:  http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure%20Charges%20Info')/items?$select=Id,Title0,WikiField
		//fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure%20Charges%20Info')/items", { mode: 'no-cors'})

		// TO GET WIKI.JSON from inhouse SP
		// goto http://tscps/prac/infrastructure
		//use the 'SharePoint Rest Client (pOwered by SharePoint Plex) extension to Chrome
		// this url /_api/web/lists/GetByTitle('Infrastructure%20Charges%20Info')/items?$select=Id,Title0,WikiField
		// copy the resulting text into the wiki.json file



		fetch(wikifile)
		.then(async response => {
			//JSON.parse(response)
			//console.log(response)
		try {
			data = await response.json()
			console.log('response data?', data);
			wikiData = data.d.results;
		} catch(error) {
			console.log('error happened here!');
			console.error(error)
		}
		});


		fetch(textfile)
		.then(async response => {
			//JSON.parse(response)
			//console.log(response)
		try {
			condTextAll = await response.json()
			console.log('response data?', condTextAll);
			condText = condTextAll.d.results;
		} catch(error) {
			console.log('error happened here!');
			console.error(error)
		}
		});
		
		
		
		/*
		.then(data => {
			console.log(data)
		}); */
 
/*
		fetch("data/wiki.xml")
		.then(response => {
			console.log(response)
			//JSON.parse(response)
			response.text()
		})
		.then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => console.log(data));
*/
  






    //initialise version, cap, date, grab saved states, set up draggable note

    document.getElementById("versionNum").innerHTML = "Version " + version + " (" + versionDate + ")";
    document.getElementById("versionNum").setAttribute("title", versionDesc);

    hintState = localStorage.getItem("hintState") ? localStorage.getItem("hintState") : "showing";
    guideState = localStorage.getItem("guideState") ? localStorage.getItem("guideState") : "showing";
    comGuideState = localStorage.getItem("comGuideState") ? localStorage.getItem("comGuideState") : "show";


    const getOffsetTop = element => {
        let offsetTop = 0;
        while(element) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        return offsetTop;
    }

    const getOffsetLeft = element => {
        let offsetLeft = 0;
        while(element) {
            offsetLeft += element.offsetLeft;
            element = element.offsetParent;
        }
        return offsetLeft;
    }

    dragElement(document.getElementById("floatableNotes"));

    document.querySelector(".txtCap").value = defaultCap;

    document.querySelector(".txtDate").value = new Date().toDateInputValue();
    document.querySelector(".txtDate").setAttribute("value", document.querySelector(".txtDate").value);

    //******************************************************

    // check for saved SaveButton state 
    spSaveBtnState();

    // show guide 
   if(guideState == "showing") {
    startIntro();
   }






    function getUser() {
        // not part but doing it athe same time :)
       
        var context = new SP.ClientContext();
        var web = context.get_web();
        var user = web.get_currentUser(); //must load this to access info.
        context.load(user);
        context.executeQueryAsync(function(){
           // alert("User is: " + user.get_title()); //there is also id, email, so this is pretty useful.
         //   console.log(user)
            loggedInUser = user.get_title();
            document.getElementById("preparedBy").innerHTML = loggedInUser;
            document.title = "s7-11 Calculation-" + loggedInUser;
        }, function(){alert(":(");});
    }


    function setUpCredits() {
    	var allCrInputs = document.querySelectorAll(".creditInput");
    	for (k = 0; k < allCrInputs.length; k++) {
    		allCrInputs[k].onblur = function(ev) {
    			if(debug) console.log("%cblurred a credit input","color:blue");
    			var thisInput = ev.srcElement; // why srcElement? i have no idea
    			if (thisInput.type == "text") {
    				thisRow = thisInput.parentNode.parentNode.parentNode;
    				thisInput.setAttribute("pattern", "^[-]?[0-9]+[.]?[0-9]*");
    				valid = thisInput.checkValidity();
    				if (parseFloat(thisInput.value) >= 0) {
    					thisInput.value = 0 - thisInput.value; //auto-convert a positive to a negative
    					valid = true;
    				}
    				if (!valid) {
    					Swal.fire({
    						icon: "error",
    						title: "Calculator says ...",
    						text: "'" + thisInput.value + "' is not valid, please enter a negative number without commas"
    					})
    				} else {
    					//  console.log("this is valid");
    					value = parseFloat(thisInput.value).toFixed(4);
    					if (thisInput.classList.contains("ETcredits")) {
    						thisInput.setAttribute("data-ets", value);
    						thisInput.setAttribute("value", value);
    						var ETSpan = thisInput.parentNode.parentNode.querySelector(".spanETs")
    						ETSpan.innerHTML = value;
    						ETSpan.setAttribute("data-row-ets", value);
    					}
    					if (thisInput.classList.contains("GFAcredits")) thisInput.setAttribute("data-gfa", value);
    					if (thisInput.classList.contains("GFAcredits")) thisInput.setAttribute("value", value);
    					if (thisInput.classList.contains("TripCredits")) thisInput.setAttribute("data-trips", value);
    					if (thisInput.classList.contains("TripCredits")) thisInput.setAttribute("value", value);
    					calculateTotals(thisRow);
    				}
    			}
    		}
    	}
    } // end of setupcredits

   function doOverrides(row, planNum) {
        //if(debug) 
		console.log("doing overides:" + planNum);
		console.log(typeof planNum);
        // console.log(row);
        var cc = row.querySelector(".rateCC").innerHTML;
          console.log("cc:" + cc);
        if (cc) {

            activeOverrides = Overrides.filter(function(el) {
                //return el.Title == cc && el.planNum.toString() == planNum;
				// title in SP, but renamed to ChargeControl, csv uses that
				return el.ChargeControl == cc;
            })

			if (debug) console.log("activeOverrides");
			if (debug) console.log(activeOverrides);

            /*fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Calculator%20Overrides')/items?$filter=Title eq '" + cc + "'", payload)
                //   fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + today.toISOString() + "' and Ended ge datetime'" + today.toISOString() + "'", payload)
                .then(function(response3) {
                    if (response3.ok) {
                        return response3.json();
                    }
                }).then(function(data3) { */

                    //d = data3.d.results[0];
                    d = activeOverrides;
					//console.log("overrides:");
                    // console.log(d);
                    if (d) { // CAN BE UNDEFINED, eg CP02 drainage has nothing to override
                        ccToDisable = d[0].OverridesChargeControl;
                        //  console.log("cc to disable:" + ccToDisable);
						//console.log("ccToDisable");
						//console.log(ccToDisable);

						var rowToDisable = document.querySelector("[data-cc='" + ccToDisable + "']");
						//.parentNode;
						//console.log("rtDisable");
						// console.log(rowToDisable);
						// console.log(rowToDisable.parentNode);


                        try {
                            // this try catch is required for older saved items, which do not
                            // have the data-cc attribute
                            rowToDisable = document.querySelector("[data-cc='" + ccToDisable + "']").parentNode;
							//console.log("rtDisable");
                            // console.log(rowToDisable);
                            rowToDisable.classList.add("inactive");
                            // work out whether to disable the whole plan:
                            rowContainer = rowToDisable.parentNode;
                            //  console.log(rowContainer);
                            var countDisabled = rowContainer.querySelectorAll(".levyRow.inactive").length;
                            var countAll = rowContainer.querySelectorAll(".levyRow").length;
                            //  console.log(countAll-countDisabled);
                            if (countAll - countDisabled == 0) {
                                parentPlan = rowContainer.parentNode.parentNode;
                                // console.log(parentPlan);
                                parentPlan.classList.add("inactive");
                            }
                        } catch (ex) {
                            console.error(ex);
                            console.error("nothing to disable for");
                            console.error(ccToDisable);
                        }
                    }
               // })
        }
    }


    // credit fields turn positive numbers to negative to add up correctly
    // this sets up blur for them
    setUpCredits();

	document.addEventListener('focusout',(ev) => {
		if(ev.target.id == "calcDescription") {
			var el = ev.target;
			if(!el.innerHTML.length) {
				el.innerHTML = "";
			}
		}
	});

	//var wrapper = document.getElementById('everything');
	document.addEventListener('blur', (ev) => {

		console.log('blurring');
		console.log(ev);

		if(this.classList.contains("txtDate")) {
			console.log('date changed');
			getLevyRates(true);
		}

	}); 

	document.querySelectorAll(".txtDate").forEach((el) => {
			el.onblur = function(ev) {
				console.log('date changed');
				getLevyRates(true);
			}

	}); 
   /* document.querySelector(".txtDate").onblur = function(ev) {
        console.log('date changed');
        // console.log(ev.target);
        getLevyRates(true);
    }; */

document.oninput = function(ev) {
  	console.log("oninput triggered:");
  	//   console.log(ev.target);
  	if (ev.target.value) { // assume this catches all inputs
  		if (ev.target.classList.contains("rateInput")) {
  			var parentPlan = ev.target.parentNode.parentNode.parentNode.parentNode.parentNode;
  			var planNum = parentPlan.getAttribute("data-plannum");
  			ev.target.setAttribute("data-value", ev.target.value);
  			ev.target.setAttribute("value", ev.target.value);
  			ev.target.onblur = function(ev2) {
  				if (planNum != "18") {
  					var resValue = ev2.target.value;
  					var parentRow = ev2.target.parentNode;
  					var nextResSpan = getNextSibling(parentRow, ".resInput");
  					nextResSpan.innerHTML = resValue;
  				} else {
  					// do something different for 18
  					note.querySelector(".fnCP18").classList.remove("hidden");
  					var planCont = ev2.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
  					var parentRow = ev2.target.parentNode.parentNode;
  					cp18Shenanigans(parentRow);
  				}
  				//console.log(ev2.relatedTarget);
  				var note = document.getElementById("floatableNotes");
  				// console.log(note.style);
  				//console.log(ev2.target.parentNode.style);
  				// note.style.top = (ev2.target.offsetTop-25) + 'px'; // mousePosition.y;
  				// note.style.left = (ev2.target.offsetLeft+400) + 'px'; // mousePosition.y;
  				note.style.top = (getOffsetTop(ev2.target)) + 'px'; // mousePosition.y;
  				note.style.left = (getOffsetLeft(ev2.target) + 200) + 'px'; // mousePosition.y;
  				// note.style.top = (ev2.relatedTarget.offsetTop-25); // mousePosition.y;
  				// note.style.left = (ev2.relatedTarget.offsetLeft+400); // mousePosition.y;
  				note.classList.remove("hidden");
  				note.querySelector("#fnManualEntry").classList.remove("hidden");
  				//if(planNum == "28") {
  				//     note.querySelector("#fnCP28").classList.remove("hidden");
  				//}
  				//  dragElement(document.getElementById("floatableNotes"));
  			}
  		}
  		//TODO:  These checkboxes should operate on the adjacent plan list only, not on everything
  		var thisStage;
  		if (ev.target.classList.contains("chkZeros")) {
  			thisStage = ev.target.parentNode.parentNode.parentNode;
  			 console.log("thisStage:" + thisStage.id);
  			var selectedRows = thisStage.querySelectorAll(".rateContainer .tr");
  			for (i = 0; i < selectedRows.length; i++) {
  				if (ev.target.checked) {
  					ev.target.setAttribute("checked", "checked");
  					var inputVal = selectedRows[i].querySelector("input").value;
  					if (inputVal == 0) selectedRows[i].classList.add("hidden");
  					//only toggle text if a button not a checkbox
  					//   document.getElementById("spanZeros").innerHTML = "show 0's";
  				} else {
  					selectedRows[i].classList.remove("hidden");
  					ev.target.removeAttribute("checked");
  					// document.getElementById("spanZeros").innerHTML = "hide 0's";
  				}
  			}
  		} // end chkZeros
  		if (ev.target.classList.contains("chkExtras")) {
  			thisStage = ev.target.parentNode.parentNode.parentNode;
  			var selectedCells = thisStage.querySelectorAll(".extra");
  			//   console.log(selectedCells);
  			for (i = 0; i < selectedCells.length; i++) {
  				if (ev.target.checked) {
  					ev.target.setAttribute("checked", "checked");
  					selectedCells[i].classList.remove("hidden");
  				} else {
  					selectedCells[i].classList.add("hidden");
  					ev.target.removeAttribute("checked");
  				}
  			}
  		} // end chkExtras
  		if (ev.target.classList.contains("chkActive")) {
  			thisStage = ev.target.parentNode.parentNode.parentNode;
  			var selectedRows = thisStage.querySelectorAll(".inactive");
  			for (i = 0; i < selectedRows.length; i++) {
  				if (ev.target.checked) {
  					selectedRows[i].classList.add("hidden");
  					ev.target.setAttribute("checked", "checked");
  					//  selectedRows[i].classList.add("inactive");
  					//  document.getElementById("spanActive").innerHTML = "show active";
  				} else {
  					selectedRows[i].classList.remove("hidden");
  					ev.target.removeAttribute("checked");
  					if (selectedRows[i].getAttribute("data-unit") == "m2") selectedRows[i].classList.remove("inactive");
  					//  document.getElementById("spanActive").innerHTML = "hide active";
  				}
  			}
  		} //end chkActive
  		if (ev.target.classList.contains("chkCP04Levy")) {
  			//  console.log("classList contains:" + ev.target.getAttribute("class"));
  			thisStage = ev.target.parentNode.parentNode.parentNode;
  			var selectedRows = thisStage.querySelectorAll("div[data-plannum='4'] .td .rateContainer .tr");
  			if(debug) console.log(selectedRows);
  			for (i = 0; i < selectedRows.length; i++) {
  				if (selectedRows[i].classList.contains("inactive")) {
  					selectedRows[i].classList.remove("inactive");
  				} else {
  					selectedRows[i].classList.add("inactive");
  				}
  			}
  		} //end chkCP04Levy
  		if (ev.target.type == "date") { //maybe irrelevant, can't put anything but date into it
  			if (ev.target.classList.contains("txtDate")) {
  				//  ev.target.setAttribute("pattern","[0-9]+[.]?[0-9]*");
  				var valid = ev.target.checkValidity();
  				if (!valid) {
  					Swal.fire({
  						icon: "error",
  						title: "Calculator says ...",
  						text: "'" + ev.target.value + "' is not valid, please enter a valid date"
  					});
  				}
  			} // end textDate
  		}
  		if (ev.target.type == "text") {
  			if (ev.target.classList.contains("rateInput")) {
  				ev.target.setAttribute("pattern", "[0-9]+[.]?[0-9]*");
  				var valid = ev.target.checkValidity();
  				if (!valid) {
  					Swal.fire({
  						icon: "error",
  						title: "Calculator says ...",
  						text: "'" + ev.target.value + "' is not valid, please enter a number without commas"
  					});
  				}
  			} // end rateInput
  			//TODO: needs a closer look/test:
  			if (ev.target.parentNode.classList.contains("DevTypeInputs")) {
  				//  console.log(ev.target);
  				//  console.log(ev.target.id, ev.target.value);
  				thisInput = ev.target;
  				var valid;
  				if (ev.target.classList.contains("creditInput")) {
  					//tempValid = thisInput.checkValidity();
  					//ignore these, do a blur instead
  				} else {
  					// setting it here so it can be changed en masse if i find a better one
  					thisInput.setAttribute("pattern", "[0-9]+[.]?[0-9]*");
  					valid = thisInput.checkValidity();
  					thisInput.setAttribute("value", thisInput.value);
  					// }
  					//if(!valid) alertify.myAlert("'" + ev.target.value + "' is not valid, please enter a number without commas");
  					if (!valid) {
  						Swal.fire({
  							icon: 'error',
  							title: "Calculator says ...",
  							text: "'" + thisInput.value + "' is not valid, please enter a number without commas"
  						})
  					} else { // valid, continue
  						if (thisInput.classList.contains("trips") != true) { //not a trip field
  							if (thisInput.classList.contains("discount") != true && thisInput.classList.contains("commercial") != true) { //not a discount field
  								var theseEts = thisInput.value * parseFloat(thisInput.getAttribute("data-multiplier"));
  								thisInput.setAttribute("data-ets", theseEts);
  								var thisRow = thisInput.parentNode;
  								// add up all current Ets;
  								//  console.log("theseEts:" + theseEts);
  								//   console.log(thisRow);
  								calculateRow(thisRow);
  							} else {
  								// a discount % value
  								if (thisInput.classList.contains("discount") == true) {
  									thisInput.setAttribute("data-discount", thisInput.value);
  								} else
  								if (thisInput.classList.contains("txtGFACom") || thisInput.classList.contains("txtGFACre")) {
  									thisInput.setAttribute("data-gfa", thisInput.value);
  									thisInput.setAttribute("value", thisInput.value)
  									var wholeStage = thisInput.parentNode.closest(".wholestagecontainer");
  									//  console.log(wholeStage);
  									ETRatio = getCP18CommercialRatio(wholeStage);
  									var etInput = wholeStage.querySelector(".txtETsCom");
  									var etGFAInput = wholeStage.querySelector(".txtGFACom");
  									var etCreInput = wholeStage.querySelector(".txtGFACre"); // any credits?
  									var etCreditVal = parseFloat(etCreInput.value);
  									var comETValue = (ETRatio * (parseFloat(etGFAInput.value) + etCreditVal)).toFixed(4);
  									etInput.value = comETValue;
  									etInput.setAttribute("data-ets-com", comETValue);
  									var comETTotalSpan = wholeStage.querySelector(".cp18CommETs");
  									var allETTotalSpan = wholeStage.querySelector(".totalEts");
  									comETTotalSpan.innerHTML = comETValue;
  									allETTotalSpan.setAttribute("data-com", comETValue);
  									//  console.log("ETRatio:" + ETRatio);
  									//calculateRow(thisRow);
  									calculateTotals(thisInput.parentNode);
  								} else {
  									// this should be a commercial ets attribute , or perhaps a credit?
  									thisInput.setAttribute("data-ets", thisInput.value);
  									thisInput.setAttribute("value", thisInput.value);
  									thisRow = thisInput.parentNode;
  									var span = thisRow.querySelector(".spanETs");
  									span.innerHTML = thisInput.value;
  									span.setAttribute("data-row-ets", thisInput.value);
  									calculateTotals(thisRow);
  								}
  							}
  						} else { // a trip field just record the trips
  							thisInput.setAttribute("data-trips", thisInput.value);
  							thisInput.setAttribute("value", thisInput.value);
  							calculateTotals(thisInput.parentNode);
  						}
  					}
  				}
  			} // end if class=devTypeSelector
  		}
  	} else { //not an input
  	}
  }

    // SET UP DOUBLE-CLICK
	//have to convert it all to 'document' to be able to handle the cloned copies
	document.ondblclick = function(ev) {
		if (ev.target.value) { //ignore inputs
		} else { //not an input
			//PLANROW - get all overrides and deal with them
			if (ev.target.parentNode.classList.contains("planRow")) {
				console.log('doubleclicked the plan row');
				var planRow = ev.target.parentNode;
				if (planRow.classList.contains("inactive")) {
					planRow.classList.remove("inactive");
					//do all overrides now
					overRideLevies = planRow.querySelectorAll("[data-overrides]");
					//  console.log(overRideLevies);
					for (i = 0; i < overRideLevies.length; i++) {
						var overR = overRideLevies[i].getAttribute("data-overrides");
						if (overR) doOverrides(overRideLevies[i], overR);
					}
				} else {
					planRow.classList.add("inactive");
				}
			} else
				//  console.log(ev.target.parentNode.getAttribute("class"));
				if (ev.target.parentNode.classList.contains("levyRow")) {
					// this worked but needed to refine it to handle the overrides
					//if(ev.target.parentNode.classList.contains("levyRow") || ev.target.parentNode.classList.contains("planRow")) {
					var levyRow = ev.target.parentNode;
					if (levyRow.classList.contains("inactive")) {
						levyRow.classList.remove("inactive");
						var overR = levyRow.getAttribute("data-overrides");
						// console.log("overrides:" + overR);
						if (overR) doOverrides(levyRow, overR);
						// do a bit more for an LAC levy row, show its partner
						if (levyRow.getAttribute("data-lac")) { //this is an LAC area
							// console.log("LAC row");
							var lacSector = levyRow.getAttribute("data-lac");
							var parentRates = levyRow.parentNode;
							// console.log(parentRates);
							var lacPairedSector = parentRates.querySelector("[data-sector='" + lacSector + "']");
							//  console.log(lacPairedSector);
							lacPairedSector.classList.remove("inactive");
						}
					} else {
						levyRow.classList.add("inactive");
					}
					cp18Shenanigans(levyRow);
				}
		}
	}




    document.onclick = function(ev) {
    	if (ev.target.value) { // an input
    		if (ev.target.classList.contains("chkSaveSP")) {
    			console.log("hit chkSaveSP");
    			var checkstg;
    			if (ev.target.checked) ev.target.setAttribute("checked", "checked");
    			if (ev.target.checked) checkstg = "checked";
    			if (!ev.target.checked) ev.target.removeAttribute("checked");
    			if (!ev.target.checked) checkstg = "notchecked";
    			// if(!ev.target.checked) {
    			swal.fire({
    				icon: "question",
    				title: "Make this permanent?",
    				html: "Click ok to remember this setting for your next calculation.",
    				showCancelButton: true,
    				confirmButtonText: "Yes",
    				cancelButtonText: "No"
    			}).then(function(res) {
    				console.log(res.value);
    				if (res.value) {
    					localStorage.setItem("SaveSP", checkstg);
    				}
    			})
    			//  } 
    		}
    		//name isn't retained pulling it back from save
    		if (ev.target.classList.contains("selectDevType")) {

				if (ev.target.checked) ev.target.setAttribute("checked", "checked");
    			if (!ev.target.checked) ev.target.removeAttribute("checked");
    			var prefix = ev.target.value.substr(0, 3);
    			var prefix2 = ev.target.value.substr(0, 3);
    			var stageOptions = ev.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode; // this is 'whole stage'
				//console.log(prefix2);
                //console.log(stageOptions);
    			//console.log(stageOptions.id);
    			//  var checkedBoxes = stageOptions.querySelectorAll(".devTypeSelector:checked").length;
    			var checkedBoxes = stageOptions.querySelectorAll(".selectDevType:checked").length;
    			if(debug) console.log("num checked boxes:" + checkedBoxes);
    			if (ev.target.value == "Subdivision") prefix2 = "Res"; // subdivision is also classified as residential
    			// however 1ET = 1 lot, instead of 4br
    			// needed it to be sub for the checkboxes
    			// if(ev.target.value == "Subdivision") prefix = "Res"; // subdivision is also classified as residential
    			// however 1ET = 1 lot, instead of 4br
    			//  var selectedRows = document.querySelectorAll("div[data-devtypes*='"+prefix2+"']");
    			var selectedPlanRows = stageOptions.querySelectorAll("div[data-devtypes*='" + prefix2 + "']");
    			 // console.log(stageOptions);
    			//  console.log(prefix2);
    			  //console.log(selectedPlanRows);
    			var cp23PlanRow = stageOptions.querySelector("div[data-plannum='23']");
    			//  selectedRows = selectedRows.querySelectorAll("div:not('.localPlan')");
    			if (ev.target.checked) {
    				devTypes.push(ev.target.value);
    				// console.log(ev.target.getAttribute("class"));
    				//  document.getElementById("chk"+prefix+"Inputs").classList.remove("hidden");
    				stageOptions.querySelector(".chk" + prefix + "Inputs").classList.remove("hidden");
    				if (selectedPlanRows) { //comes out null sometimes
    					for (i = 0; i < selectedPlanRows.length; i++) {
    						if (!selectedPlanRows[i].classList.contains("localPlan")) {
    							selectedPlanRows[i].classList.remove("inactive");
    							var planLevies = selectedPlanRows[i].querySelectorAll(".levyRow");
    							if (prefix2 == "Res") {
    								for (k = 0; k < planLevies.length; k++) {
    									if (planLevies[k].getAttribute("data-unit") != "ET") {
    										if (checkedBoxes <= 1) planLevies[k].classList.add("inactive");
    									}
    								}
    							} else
    							if (prefix2 == "Com") {
    								for (k = 0; k < planLevies.length; k++) {
    									if (planLevies[k].getAttribute("data-unit") == "m2") {
    										planLevies[k].classList.remove("inactive");
    									}
    								}
    								//  console.log(planLevies);
    								var trcpSectors = selectedPlanRows[i].querySelectorAll("[data-unit='Trip']:not(.hidden)");
    								if (trcpSectors.length > 1) {
    									for (k = 0; k < trcpSectors.length; k++) {
    										if (checkedBoxes <= 1) trcpSectors[k].classList.add("inactive");
    									}
    								}
    								//CP 23 is applicable to commercial devt but rarely applied
    								cp23PlanRow.classList.add("inactive");
    							}
    							//  selectedRows[i].querySelector("input[type='checkbox']").checked = true;
    						}
    					}
    					// console.log(selectedRows);
    				}
    				if (ev.target.classList.contains("chkCommercial")) {
    					console.log("COMM CHECKED");
    					if (comGuideState == "show") {
    						introJs().exit();
    						startComGuide();
    					}
    				}
    				if (guideState == "showing" && !ev.target.classList.contains("txtCap")) {
    					introJs().exit();
    					startIntro();
    					// introJs().refresh();
    				}
    				//   introUs.refresh();
    			} else {
    				devTypes = devTypes.filter(function(item) {
    					return item !== ev.target.value;
    				})
    				// document.getElementById("chk"+prefix+"Inputs").classList.add("hidden");
    				stageOptions.querySelector(".chk" + prefix + "Inputs").classList.add("hidden");
    				// must have been borrowed from somewhere, do not have 'selectedrows' in this part of the function
    				for (i = 0; i < selectedPlanRows.length; i++) {
    					selectedPlanRows[i].classList.add("inactive");
    					// selectedRows[i].querySelector("input[type='checkbox']").checked = false;
    				}
    				if (guideState == "showing" && !ev.target.classList.contains("txtCap")) {
    					introJs().exit();
    					startIntro();
    					// introJs().refresh();
    				}
    			}
    		} else {
    			console.log("Not a primary checkbox");
    			//  console.log(ev.target.type);
    			// This was not required by Chrome, which treated it as an input, but Edge 14 didn't, so I needed to add this
    			//&& !(ev.target.classList.contains("chkCP04Levy"))
    			if (window.navigator.userAgent.indexOf("Edge") > -1) {
    				if (ev.target.type == "checkbox") ev.target.dispatchEvent(new Event('input', {
    					bubbles: true
    				}));
    			}
    			//ev.target.input();
    			if (ev.target.id == "btnGuide") {
    				if(debug) console.log("guide button clicked");
    				startIntro();
    			}
    			if (ev.target.id == "btnComGuide") {
    				if(debug) console.log("COM guide button clicked");
    				startComGuide();
    			}
    			if (ev.target.id == "btnHints") {
    				if(debug) console.log("hint button clicked");
    				toggleHints();
    			}
    			if (ev.target.id == "btnSave") {
    				if(debug) console.log("save Button clicked");
    				saveStatus(planList, "excel");
    			}
    			if (ev.target.id == "btnSaveWord") {
    				if(debug) console.log("save To Word Button clicked");
    				saveStatus(planList, "word");
    			}
    			if (ev.target.id == "btnImport") {
    				importCalc();
    			}
    			if (ev.target.classList.contains("chkCap")) {
    				console.log("cap checked/unchecked");
    				var wholeStage = ev.target.parentNode.closest(".wholestagecontainer");
    				//    console.log(wholeStage.getAttribute("class"));
    				var capCells = wholeStage.querySelectorAll(".cap");
    				//   console.log(capCells);
    				for (i = 0; i < capCells.length; i++) {
    					if (ev.target.checked) {
    						capCells[i].classList.remove("hidden");
    					} else {
    						capCells[i].classList.add("hidden");
    					}
    				}
    			}
    			if (ev.target.classList.contains("discountCheckBox")) {
    				// console.log(ev.target.parentNode.parentNode.parentNode.parentNode.parentNode.id);
    				var wholeStage = ev.target.parentNode.closest(".wholestagecontainer");
    				var planContainer = wholeStage.querySelector(".planContainer");
    				//   console.log(planContainer.getAttribute("class"));
    				// console.log(ev.target.name);
    				var nextInput = getNextSibling(ev.target, "input.discount");
    				if (ev.target.checked) {
    					nextInput.value = ev.target.value;
    					var discountCells = planContainer.querySelectorAll(".discount");
    					for (i = 0; i < discountCells.length; i++) discountCells[i].classList.remove("hidden");
    				} else {
    					nextInput.value = 0;
    					var hideIt = true;
    					var discountBoxes = ev.target.parentNode.querySelectorAll(".discountCheckBox");
    					for (i = 0; i < discountBoxes.length; i++) {
    						if (discountBoxes[i].checked) hideIt = false;
    					}
    					if (hideIt == true) {
    						var discountCells = planContainer.querySelectorAll(".discount");
    						for (i = 0; i < discountCells.length; i++) discountCells[i].classList.add("hidden");
    					}
    				}
    			}
    			if (ev.target.classList.contains("btnCalculate")) {
    				//    if(ev.target.id == "btnCalculate") {  //weird, doesn't have its name after copying
    				console.log('calculate button clicked');
    				//var activeLevyRows = ev.target.parentNode.parentNode.querySelectorAll(".levyRow:not('.inactive')");
    				//*********************************
    				// INITIALISE
    				//*********************************
    				var wholeStage = ev.target.parentNode.closest(".wholestagecontainer");


					var flashingButtons = wholeStage.querySelectorAll(".btnAutoFill");

					for(i=0; i< flashingButtons.length; i++) {
					flashingButtons[i].classList.remove(".btnAutoFill");
					}


    				//if(debug) 
					console.log("wholeStage in INitialise");
					console.log(wholeStage);
    				var stageTotal = 0;
    				var stageDiscount = 0;
    				var stageDiscountedTotal = 0;
    				var stageCappedTotal = 0;
    				var stageResTotal = 0;
    				var EmpDiscount = wholeStage.querySelector(".chkEmpDiscount").checked ? wholeStage.querySelector(".txtEmpDiscount").value / 100 : 0;
    				var EBEDiscount = wholeStage.querySelector(".chkEBEDiscount").checked ? wholeStage.querySelector(".txtEBEDiscount").value / 100 : 0;
    				var capMultiplier = parseFloat(wholeStage.querySelector(".spanCapMultiplier").getAttribute("data-capmultiplier"));
    				var capValue = wholeStage.querySelector("input.txtCap").value;
    				var cp18Ets = 0;
    				var cp18ETMultiplier = 0;
    				var CappedRunningTotal = 0;
    				// console.log("CAP MULTIPLIER:" + capMultiplier);
    				//*********************************
    				// COUNT TRCP SECTORS
    				//*********************************
    				var activeTRCPRows = wholeStage.querySelectorAll("div[data-plannum='4'] .td .rateContainer .tr:not(.inactive)").length;
    				var inactiveTRCPPlan = wholeStage.querySelector("[data-plannum='4']").classList.contains('inactive');
    				if (activeTRCPRows == 0 && inactiveTRCPPlan == false) {
    					Swal.fire({
    						icon: 'warning',
    						html: "No TRCP sector selected. If the TRCP (CP04) is part of this calculation, double-click a sector and click CALCULATE! again.<br /><br >If the TRCP is not required, double-click the CP04 Title to remove it entirely."
    					})
    				}
    				//*********************************
    				// ITERATE THROUGH ACTIVE LEVY ROWS
    				//*********************************
    				var activeLevyRows = wholeStage.querySelectorAll(".levyRow:not(.inactive)");
    				for (i = 0; i < activeLevyRows.length; i++) {
    					var parentRow = activeLevyRows[i].parentNode.parentNode.parentNode;
    					var planNum = parentRow.getAttribute("data-plannum");
    					if (!parentRow.classList.contains("inactive")) {
    						var inputVal = activeLevyRows[i].querySelector("input.rateInput").getAttribute("data-value");
    						var resInputVal = activeLevyRows[i].querySelector(".resInput").textContent;
    						//   console.log("inputVal:" + inputVal + "; resInputVal:" + resInputVal);
    						if (inputVal == null) {
    							console.log(parentRow);
    							alert("some null values, fix before continuing");
    							return;
    							// alert('null input for ' & parentRow.getAttribute("data-prefix"));
    						}
    						var ratePerUnit = activeLevyRows[i].querySelector(".rateAmount").getAttribute("data-rate");
    						var rateUnit = activeLevyRows[i].getAttribute("data-unit");
    						var total = ratePerUnit * inputVal;
    						if (rateUnit == "Space") {
    							if(debug) console.log("space ratePerUnit=" + ratePerUnit);
    							if(debug) console.log("space inputVal=" + inputVal);
    							if(debug) console.log("space total=" + total);
    						}
    						var resTotal = ratePerUnit * resInputVal;
    						var capTo = resTotal * capMultiplier;
    						var capAdjust = resTotal - capTo;
    						if (planNum == "28") {
    							resTotal = 0;
    							capTo = 0; // cp28 is not capped
    							capAdjust = 0;
    							try {
    								document.querySelector("#fnCP28").classList.remove("hidden");
    							} catch (ex) {
    								// this was created b4 the CP 28 note was added
    								var note = document.getElementById("floatableNotes");
    								note.classList.remove("hidden");
    								note.style.top = (getOffsetTop(parentRow)) + 'px'; // mousePosition.y;
    								note.style.left = (getOffsetLeft(parentRow) + 200) + 'px'; // mousePosition.y;
    								note.querySelector("#fnCP18").classList.remove("hidden");
    								note.querySelector("#fnCP18").innerHTML = "CP 28 is not affected by the CAP.  A calculator bug pertaining to CP28 has been amended since this calculation was saved, please check results, and if necessary, create a fresh entry."
    							}
    						}
    						if (rateUnit == "Space") {
    							capAdjust = 0;
    							capTo = total;
    						}
    						//  if (resInputVal == 0) capTo = total; //  
    						total = isNaN(total) ? 0 : total;
    						resTotal = isNaN(resTotal) ? 0 : resTotal;
    						// firstly this is a simple method, only wworks if no residential devt will ever accrue one of these discounts
    						var nonResTotal = total - resTotal;
    						var tempEBEDiscount = nonResTotal != 0 ? EBEDiscount : 0;
    						var tempEmpDiscount = nonResTotal != 0 ? EmpDiscount : 0;
    						capTo = isNaN(capTo) ? 0 : capTo;
    						// if(rateUnit == "Space") capTo = total;
    						//    capTo = nonResTotal == total ? total : capTo; 
    						var discountedTotal = total; // starts off being the same
    						var cappedTotal = total; //starts off being the same
    						// var cappedTotal = total-resTotal + capTo;
    						var discountDesc = "";
    						var discountShortDesc = "";
    						var EBEDiscountAmount = tempEBEDiscount * nonResTotal;
    						// var EmpDiscountAmount = EmpDiscountAmount != 0 ? EmpDiscount * EBEDiscountAmount : EmpDiscount * nonResTotal;
    						var EmpDiscountAmount = tempEmpDiscount * nonResTotal;
    						// console.log("EBE Discount:" + EBEDiscount);
    						// console.log("Emp Discount:" + EmpDiscount);
    						//   console.log("EBE DiscountAmount: (" + tempEBEDiscount + ") " + EBEDiscountAmount +" / " + nonResTotal);
    						//     console.log("EMP DiscountAmount: (" + tempEmpDiscount + ") " + EmpDiscountAmount +" / " + EBEDiscountAmount);
    						discountDesc = EBEDiscountAmount != 0 ? "EBE Discount of " + parseFloat(EBEDiscountAmount).toFixed(2).toString() + ", being " + tempEBEDiscount * 100 + "% of " + parseFloat(nonResTotal).toFixed(2).toString() : "";
    						discountShortDesc = EBEDiscountAmount != 0 ? "EBE:" + tempEBEDiscount * 100 + "%" : "";
    						// intention here: if there's a previously discounted amount, use that, otherwise use nonResTotal;
    						discountDesc = EmpDiscountAmount != 0 ? discountDesc + " Emp Discount of " + parseFloat(EmpDiscountAmount).toFixed(2).toString() + ", being " + tempEmpDiscount * 100 + "% of " + parseFloat(nonResTotal).toFixed(2).toString() : discountDesc;
    						discountShortDesc = EmpDiscountAmount != 0 ? discountShortDesc + " Emp:" + tempEmpDiscount * 100 + "%" : discountShortDesc;
    						var discountAmount = tempEmpDiscount > 0 ? nonResTotal : EBEDiscountAmount; /// does this go over the nonrestotal
    						//discountAmount = EBEDiscount > 0 ? discountAmount : 0;
    						//    ctPlaces = 0; // for total
    						if (!resTotal) resTotal = 0; //catch null values
    						//activeLevyRows[i].querySelector(".rateTotal").innerHTML = total.toLocaleString('en-au',{maximumFractionDigits:2});
    						//activeLevyRows[i].querySelector(".resTotal").innerHTML = resTotal.toLocaleString('en-au',{maximumFractionDigits:2});
    						activeLevyRows[i].querySelector(".rateTotal").innerHTML = (parseFloat(total).toFixed(2)).toLocaleString('en-au');
    						activeLevyRows[i].querySelector(".resTotal").innerHTML = (parseFloat(resTotal).toFixed(2)).toLocaleString('en-au');;
    						activeLevyRows[i].querySelector(".rateDiscount").innerHTML = (parseFloat(discountAmount).toFixed(2)).toLocaleString('en-au');
    						activeLevyRows[i].querySelector(".rateDiscount").setAttribute("data-discountdesc", discountDesc);
    						activeLevyRows[i].querySelector(".rateDiscount").setAttribute("data-discountEBE", tempEBEDiscount);
    						activeLevyRows[i].querySelector(".rateDiscount").setAttribute("data-discountEmp", tempEmpDiscount);
    						activeLevyRows[i].querySelector(".rateDiscount").setAttribute("data-discountEBEamount", EBEDiscountAmount);
    						activeLevyRows[i].querySelector(".rateDiscount").setAttribute("data-discountEmpamount", EmpDiscountAmount);
    						activeLevyRows[i].querySelector(".rateDiscountDesc").innerHTML = discountShortDesc;
    						activeLevyRows[i].querySelector(".rateDiscountedTotal").innerHTML = (parseFloat(total - discountAmount).toFixed(2)).toLocaleString('en-au');

                            // places = 3 is required to make the cap calculation come out exactly right
    						var ctPlaces = 3;
    						if (planNum == "18") ctPlaces = 3;
    						// if(rateUnit == "m2") ctPlaces = 2;
    						if (planNum == "18" && rateUnit == "m2") { //don't including m2 in total, using converted ETs instead
    						} else {
    							// TODO: move this to AFTER any discount, ie if its discounted it might not need capping ....
    							// or otherwise get a call from someone on which order these thigns should go in
    							var cTotal = total - resTotal + capTo - discountAmount;
    							// if(rateUnit == "Space") console.log("cTotal:" + cTotal);
    							activeLevyRows[i].querySelector(".rateCappedTotal").innerHTML = (parseFloat(cTotal).toFixed(ctPlaces)).toLocaleString('en-au');
    							// var capAdjust = total-cTotal; // adjustment for charge control
    							activeLevyRows[i].querySelector(".rateCapAdjust").innerHTML = "(" + (parseFloat(capAdjust).toFixed(ctPlaces)).toLocaleString('en-au') + ")";
    							// activeLevyRows[i].querySelector(".rateCapAdjust").setAttribute("data-capadj", capAdjust);
    							stageTotal = stageTotal + total;
    							stageDiscount = stageDiscount + discountAmount;
    							stageDiscountedTotal = stageDiscountedTotal + (total - discountAmount);
    							// stageCappedTotal = stageCappedTotal + (total-resTotal+capTo) - discountAmount;
    							// if(planNum == "18") {
    							//  stageCappedTotal = stageCappedTotal + Math.round(parseFloat(cTotal).toFixed(ctPlaces)*10000/10000); //cTotal;
    							// } else {
    							stageCappedTotal = stageCappedTotal + parseFloat(cTotal.toFixed(ctPlaces)); //cTotal;
    							// }
    							// stageCapAdjust = stageCapAdjust + stageCappedTotal;
    							//  stageCappedTotal = CappedRunningTotal;
    							stageResTotal = stageResTotal + resTotal;
    						}
    						//stageCappedTotal = ???
    						//     } // end not plan 18/m2
    						// }
    					} // end plan not inactive
    				} // END OF ITERATION THROUGH ALL ACTIVE ROWS
    				//function inside btnCalculate
    				var resEts = wholeStage.querySelector(".totalResEts").innerHTML;
					if(debug) {
    					if (rateUnit == "Space") console.log("stageResTotal:" + stageResTotal);
    					if (rateUnit == "Space") console.log("resETs:" + resEts);
					}
    				var costOfOneLot = 0;
    				if (resEts > 0) costOfOneLot = stageResTotal / parseFloat(resEts);
    				// FIXED: commercial contribution with offsite parking generateD infinite costOfOneLot. dealt 
    				// with it initially by adding isFinite(costOfOneLot) && to if statement, fixed it for 'space' would it also occur
    				// for others?
    				if (costOfOneLot > 0) {
    					wholeStage.querySelector(".spanOneLotCostDesc").innerHTML = " ~ one ET cost: $";
    					var cap = wholeStage.querySelector(".txtCap").value;
    					if (costOfOneLot > cap) {
    						var capMultiplier = cap / costOfOneLot;
    						wholeStage.querySelector(".spanCapMultiplier").innerHTML = (capMultiplier * 100).toFixed(5);
    						wholeStage.querySelector(".spanCapMultiplier").setAttribute("data-capmultiplier", capMultiplier);
    						// wholeStage.querySelector(".fnCAPcap").innerHTML = capValue;
    						document.getElementById("fnCAPcap").innerHTML = capValue;
    						document.getElementById("fnCAPreduction").innerHTML = (capMultiplier * 100).toFixed(5) + "%";
    						wholeStage.querySelector(".spanCapMultiplierDesc").innerHTML = " ~ cap to ";
    						// wholeStage.querySelector(".chkCap").checked = true;
    						if (!wholeStage.querySelector(".chkCap").checked) wholeStage.querySelector(".chkCap").click();
    						wholeStage.querySelector(".chkCap").checked = true; // enough during the calc
    						wholeStage.querySelector(".chkCap").setAttribute("checked", "checked"); //needed to bring back the check status from saved calc
    						var note = document.getElementById("floatableNotes");
    						note.classList.remove("hidden");
    						document.getElementById("fnCAP").classList.remove("hidden");
    						note.style.top = (getOffsetTop(ev.target) - 25) + 'px'; // m
    						note.style.left = (getOffsetLeft(ev.target) + 400) + 'px'; // mousePosition.y;
    						//note.style.top = (ev.target.offsetTop-25) + 'px'; // m
    						//note.style.left = (ev.target.offsetLeft+400) + 'px'; // mousePosition.y;
    						//  dragElement(note);
    					} else {
    						wholeStage.querySelector(".spanCapMultiplier").innerHTML = "";
    						wholeStage.querySelector(".spanCapMultiplier").setAttribute("data-capmultiplier", "1");
    						wholeStage.querySelector(".spanCapMultiplierDesc").innerHTML = "";
    						if (wholeStage.querySelector(".chkCap").checked) wholeStage.querySelector(".chkCap").click();
    						wholeStage.querySelector(".chkCap").checked = false;
    					}
    				} else {
    					wholeStage.querySelector(".spanOneLotCostDesc").innerHTML = "";
    					wholeStage.querySelector(".spanCapMultiplier").innerHTML = "";
    					wholeStage.querySelector(".spanCapMultiplier").setAttribute("data-capmultiplier", "1");
    					wholeStage.querySelector(".spanCapMultiplierDesc").innerHTML = "";
    					if (wholeStage.querySelector(".chkCap").checked) wholeStage.querySelector(".chkCap").click();
    					wholeStage.querySelector(".chkCap").checked = false;
    				}
    				wholeStage.querySelector(".spanOneLotCost").innerHTML = costOfOneLot.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".spanOneLotCost").setAttribute("data-onelot", costOfOneLot);
    				wholeStage.querySelector(".stageGrandTotal").innerHTML = stageTotal.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".stageGrandTotal").setAttribute("data-stagegrandtotal", stageTotal);
    				wholeStage.querySelector(".stageResidentialTotal").innerHTML = stageResTotal.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".stageResidentialTotal").setAttribute("data-stagerestotal", stageResTotal);
    				wholeStage.querySelector(".stageTotalDiscount").innerHTML = stageDiscount.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".stageTotalDiscount").setAttribute("data-stagetotaldiscount", stageDiscount);
    				wholeStage.querySelector(".stageDiscountedTotal").innerHTML = stageDiscountedTotal.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".stageDiscountedTotal").setAttribute("data-stagediscountedtotal", stageDiscountedTotal);
    				wholeStage.querySelector(".stageCappedTotal").innerHTML = stageCappedTotal.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				});
    				wholeStage.querySelector(".stageCappedTotal").setAttribute("data-stagecappedtotal", stageCappedTotal);
    				var stageAdjust = stageTotal - stageCappedTotal;
    				wholeStage.querySelector(".stageCapAdjust").innerHTML = "(" + stageAdjust.toLocaleString('en-au', {
    					maximumFractionDigits: 2
    				}) + ")";
    				wholeStage.querySelector(".stageCapAdjust").setAttribute("data-stagecapadjust", stageAdjust);
    			}
    			if (ev.target.classList.contains("btnReZero")) {
    				//if(ev.target.id == "btnReZero") {
    				console.log("btnrezero clicked");
    				//  var totalTable = ev.target.parentNode.parentNode.parentNode;
    				//var adjacentPlanContainer = getNextSibling(totalTable.parentNode.parentNode.parentNode,".planContainer");
    				var controlsDiv = ev.target.parentNode;
    				var adjacentPlanContainer = getNextSibling(controlsDiv, ".planContainer");
    				var allInputRows = adjacentPlanContainer.querySelectorAll(".levyRow");
    				//TODO:  REZERO discount columns
    				for (i = 0; i < allInputRows.length; i++) {
    					var input = allInputRows[i].querySelector("input.rateInput");
    					var resInput = allInputRows[i].querySelector(".resInput");
    					var total = allInputRows[i].querySelector(".rateTotal");
    					var discount = allInputRows[i].querySelector(".rateDiscount");
    					var resTotal = allInputRows[i].querySelector(".resTotal");
    					var capAdj = allInputRows[i].querySelector(".rateCapAdjust");
    					var capTotal = allInputRows[i].querySelector(".rateCappedTotal");
    					var discTotal = allInputRows[i].querySelector(".rateDiscountedTotal");
    					var discDesc = allInputRows[i].querySelector(".rateDiscountDesc");
    					input.value = 0;
    					input.setAttribute("data-value", "0");
    					resInput.innerHTML = "0";
    					total.innerHTML = "0";
    					discount.innerHTML = "0";
    					discTotal.innerHTML = "0";
    					discDesc.innerHTML = "";
    					resTotal.innerHTML = "0";
    					capAdj.innerHTML = "0";
    					capTotal.innerHTML = "0";
    				}
    				adjacentPlanContainer.querySelector(".stageResidentialTotal").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageGrandTotal").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageCapAdjust").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageCappedTotal").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageTotalDiscount").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageDiscountedTotal").innerHTML = "0";
    				adjacentPlanContainer.querySelector(".stageResidentialTotal").setAttribute("data-stagerestotal", "0");
    				adjacentPlanContainer.querySelector(".stageGrandTotal").setAttribute("data-stagegrandtotal", "0");
    				adjacentPlanContainer.querySelector(".stageTotalDiscount").setAttribute("data-stagediscountedtotal", "0");
    				adjacentPlanContainer.querySelector(".stageDiscountedTotal").setAttribute("data-stagediscountedtotal", "0");
    				adjacentPlanContainer.querySelector(".stageCapAdjust").setAttribute("data-stagecapadjust", "0");
    				adjacentPlanContainer.querySelector(".stageCappedTotal").setAttribute("data-stagecappedtotal", "0");
    			}
    			if (ev.target.classList.contains("btnAutofill")) {


						

    				console.log("button Autofill clicked");
    				var totalTable = ev.target.parentNode.parentNode.parentNode.parentNode;
                    console.log("totalTable:");
					console.log(totalTable);
    				var valueSpans = totalTable.querySelectorAll(".stageTotal");
    				var commExtra = 0;
    				var wholeStage = totalTable.parentNode.closest(".wholestagecontainer");
					wholeStage.querySelector(".btnAutoFill").classList.remove("btnGlow");
					wholeStage.querySelector(".btnCalculate").classList.add("btnGlow");

                    console.log("wholeStage");
					console.log(wholeStage);
    				var trcpInactive = wholeStage.querySelector("[data-prefix='CP04']").classList.contains("inactive");
    				console.log("trcpHidden:" + trcpInactive);
    				for (i = 0; i < valueSpans.length; i++) {
    					//  commExtra = 0;
    					var unit = valueSpans[i].getAttribute("data-unit");
    					// console.log("unit:" + unit);
    					var unitVal = valueSpans[i].innerHTML;
    					var resUnitVal = "";
    					//var comETs = 0;
    					if (unit == "ET" || unit == "Trip") { //residential numbers
    						resUnitVal = valueSpans[i].getAttribute("data-res");
    					}
    					if (unit == "ET") {
    						//  console.log("COM ETS =" + comETs);
    						if (valueSpans[i].getAttribute("data-com")) commExtra = parseFloat(valueSpans[i].getAttribute("data-com"));
    					}
    					//console.log("unit:" + unit);
    					//this gets the next plan container
    					var adjacentPlanContainer = getNextSibling(totalTable.parentNode.parentNode.parentNode, ".planContainer");
    					var activeCharges = adjacentPlanContainer.querySelectorAll("div[data-unit='" + unit + "']:not(.inactive)");
    					var lacCharges = adjacentPlanContainer.querySelectorAll("[data-lac]:not(.inactive)");
    					var allCharges = adjacentPlanContainer.querySelectorAll("div[data-unit='" + unit + "']");
    					//console.log("activeCharges for " + unit);
    					// console.log(activeCharges);
    					var gotAnLAC = lacCharges ? lacCharges.length : 0;
    					// if(unit == "Trip") {
    					// }
    					if(debug)  console.log("gotanlac:" + gotAnLAC);
    					if ((((unit == "Trip" && !trcpInactive) || unit == "m2") && gotAnLAC == 0 && activeCharges.length > 1) || ((unit == "Trip" && !trcpInactive) && gotAnLAC >= 1 && activeCharges.length > 2)) {
    						//  var pausedCharges = activeCharges;
    						//var quitTrips = false;
    						var title, text;
    						if (unit == "Trip" && gotAnLAC >= 1 && activeCharges.length > 2) {
    							//  console.log("get the trcp visibility status");
    							//  console.log();
    							title = "More than 2 TRCP Sectors active (inc LAC)"
    							text = "About to add the number of trips to more than 2 sectors (inc LAC), did you mean to do this?"
    						} else
    						if (unit == "Trip" && gotAnLAC == 0 && activeCharges.length > 1) {
    							title = "More than 1 TRCP Sector active"
    							text = "About to add the number of trips to multiple sectors, did you mean to do this?"
    						} else
    						if (unit == "m2") {
    							title = "More than 1 CP18 GFA levy active"
    							text = "About to add the number of m2 to multiple CP18 levies, did you mean to do this?<br /><br />If yes, please enter the applicable GFA separately below, otherwise double-click the levies which do not apply to deactive them."
    						}
    						var popup = Swal.fire({
    							icon: 'warning',
    							title: title,
    							// text:  text,
    							html: text,
    							//showCloseButton: true,
    							//showCancelButton: true,
    							//  cancelButtonColor: '#3085d6',
    							confirmButtonText: "Continue",
    							// cancelButtonText: "Stop and fix",
    							// focusCancel: true
    						}).then((result) => {
    							console.log(result);
    							if (result.value) {} else {
    								// stopped to fix, do nothing
    								// quitTrips = true;
    								// do nothing:
    							}
    						});
    					}
    					console.log("started the else");
    					// var theseCharges = activeCharges;
    					calculate2(allCharges, unitVal, resUnitVal, commExtra);
    					/*   for(k=0; k< theseCharges.length; k++) {
    					       //console.log("class:" + activeCharges[k].getAttribute("class"));
    					       var rInput = theseCharges[k].querySelector("input.rateInput");
    					       rInput.value = parseFloat(unitVal).toString(); // to remove unnecessary zeros
    					       rInput.setAttribute("data-value", parseFloat(unitVal).toString());
    					   } */
    					//  } // end if not trip
    				}
    			}
    			if (ev.target.classList.contains("chkClone")) {
    				var numStages = document.querySelectorAll(".wholestagecontainer").length;
    				console.log('button clicked');
    				var clone = ev.target.parentNode.parentNode.parentNode.parentNode.parentNode.cloneNode(true);
					console.log(clone);
    				clone.id = "wholestage" + numStages;
    				//  console.log(clone);
    				clone.querySelector(".stageLabel").innerHTML = clone.querySelector(".stageLabel").innerHTML + " (COPY)";
    				cloneKids = clone.childNodes;
    				for (i = 0; i < cloneKids.length; i++) {
    					if (cloneKids[i].id) cloneKids[i].id = cloneKids[i].id + numStages;
    					cloneGrandkids = cloneKids[i].childNodes;
    					for (k = 0; k < cloneGrandkids.length; k++) {
    						if (cloneGrandkids[k].id) cloneGrandkids[k].id = cloneGrandkids[k].id + numStages;
    					}
    				}
    				// clone.parentNode.appendChild(clone);
    				ev.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.appendChild(clone);

						// remake the listener for changing the date
						document.querySelectorAll(".txtDate").forEach((el) => {
							el.onblur = function(ev) {
								console.log('date changed');
								getLevyRates(true);
							}

					}); 
    			}
    			//if(ev.target.id == "chkMultiRes") {
    			if (ev.target.classList.contains("chkMultiRes")) {
    				console.log("multi dwelling res clicked");
    				var tripInput = ev.target.parentNode.querySelector(".txtTripsRes");
    				if (ev.target.checked) {
    					tripInput.setAttribute("data-multiplier", ev.target.getAttribute("data-tripmultiplier"));
    				} else {
    					tripInput.setAttribute("data-multiplier", "6.5");
    				}
    				calculateRow(ev.target.parentNode);
    			}
    		}
    	} else { //not an input
    		console.log("clicked something else in comp func:");
			//console.log(ev.target);
			// should the buttons flash?

			var stageContainer = ev.target.parentNode.closest(".wholestagecontainer");

			try {

				var allinputsTotal = 0.0;
				var allinputs = stageContainer.getElementsByClassName("stageTotal");

				//console.log(allinputs);

				for(i=0; i< allinputs.length; i++) {

						allinputsTotal = allinputsTotal + parseFloat(allinputs[i].textContent);

				};

					console.log("allinputsTotal:" + allinputsTotal);

				var firstInputVal = parseFloat(stageContainer.querySelector(".rateInput").value);
				console.log(firstInputVal);

				if(allinputsTotal > 0 && !firstInputVal > 0 && typeof firstInputVal == "number") {
					stageContainer.querySelector(".btnAutoFill").classList.add("btnGlow");
				} else {
					stageContainer.querySelector(".btnAutoFill").classList.remove("btnGlow");
				}
			} catch (ex) {


				var flashingButtons = document.querySelectorAll(".btnAutoFill");

					for(i=0; i< flashingButtons.length; i++) {
					flashingButtons[i].classList.remove(".btnAutoFill");
					}

			}

			
			

			if (ev.target.classList.contains("infoImage")) {
			//	if (ev.target.parentNode.classList.contains('infoDiv')) {
					//console.log(ev.target);
					if(debug) console.log(ev.target);
					//var pageId = ev.target.querySelector(".infoImage").getAttribute("data-helpid");
					var pageId = ev.target.parentNode.getAttribute("data-helpid");
					console.log(pageId);
					if (pageId) {
						helpPopup(pageId);
					}
				}

    		if (ev.target.id == "calcDescription") {
    			ev.target.onblur = function(ev2) {
    				document.title = "s7-11 Calculation-" + ev2.target.textContent.replace("/", "") + "-" + loggedInUser;
    			}
    		}
    		if (ev.target.id == "closeFloatable") {
    			ev.target.parentNode.parentNode.classList.add("hidden");
    		}

    	}
    }


    
    function helpPopup(pageId) {
		/*
    	payload = {
    		method: 'GET',
    		headers: {
    			"Accept": "application/json; odata=verbose"
    		},
    		credentials: 'same-origin' // or credentials: 'include'  
    	} */
    	//fetch("https://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Calculation Data')/items(" +id+ ")", payload)
    	//fetch is an es6 function, fetch.umd.js is a pollyfill shim to make it work with IE10
    	// when IE10 well and truly gone, the script link above can be removed, also the promise polyfill
    	// ACTUALLy there's a lot of ES6 features now, so forget about using IE10 with this

    	if(debug) console.log("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure Charges Info')/items(" + pageId + ")");
		console.log('help popup')

        //TODO:  REWRITE FOR NON-FETCH
        //fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure Charges Info')/items(" + pageId + ")", payload).then(function(response) {
		//fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure Charges Info')/items(" + pageId + ")", payload).then(function(response) {


		
		console.log(data);
		console.log(wikiData);
		console.log(pageId);


		 function filterObject(id) {
			return wikiData.filter(function(item) {
				return item.ID == id;
			})
		}
	
		var tmpWiki = filterObject(parseInt(pageId));

		console.log(tmpWiki);




    	//	if (response.ok) {
    	//		return response.json();
    	//	}
    	//}).then(function(data) {
    		//    console.log(data);
    		html = "";
    		//records = data.d;
    		//  console.log(data.d);
    		var footer = "<span class='sweetFooter'>Click to view the <a class='sweetFooter' target='_blank' href='http://tscps/prac/infrastructure/Infrastructure Charges Info/" + tmpWiki[0].Title0 + ".aspx'>source</a> wiki page in a new tab.</span>";
			//var footer = "";
    		Swal.fire({
    			icon: "info",
    			title: tmpWiki[0].Title0,
    			html: tmpWiki[0].WikiField,
    			width: 800,
    			footer: footer
    		});
    	//});
    }




    function calculate2(rowSet, unitVal, resUnitVal, comETs) {
    	console.log("CALCULATE 2 TRIGGERED");
    	//if(debug) 
		console.log(unitVal);
    	//if(debug) 
		console.log(rowSet);
    	//  console.log("comETs:" + comETs)
    	var tempVal = 0;
    	for (k = 0; k < rowSet.length; k++) {
    		var parentPlan = rowSet[k].parentNode.parentNode.parentNode;
    		var unit = rowSet[k].getAttribute("data-unit");
    		var plannum = parentPlan.getAttribute("data-plannum");
    		// console.log("PlanNum:" + plannum);
    		var rInput = rowSet[k].querySelector("input.rateInput");
    		tempVal = parseFloat(unitVal);
    		if (plannum == "18" && unit == "m2" && !rowSet[k].classList.contains("inactive")) {
    			// cp18Shenanigans(rowSet[k]);
    			var cp18Ets = parentPlan.querySelector(".levyRow[data-unit='ET']");
    			var cp18EtsInput = cp18Ets.querySelector("input.rateInput");
    			var cp18noncomETVal = parseFloat(cp18EtsInput.getAttribute("data-ets"));
    			// console.log(cp18Ets);
    			var multiplier = rowSet[k].querySelector(".rateAmount").getAttribute("data-1etmultiplier");
    			var m2ETs = (cp18noncomETVal + (parseFloat(multiplier) * parseFloat(tempVal))).toFixed(5);
    			cp18EtsInput.value = parseFloat(m2ETs).toString();
    			cp18EtsInput.setAttribute("data-value", parseFloat(m2ETs).toString());
    			// don't change 'data-ets' - keep it in case we need to recalc
    			cp18EtsInput.setAttribute("data-m2", parseFloat(m2ETs).toString());
    			cp18EtsInput.setAttribute("value", parseFloat(m2ETs).toString());
    		} else {
    			if (unit == "ET") {
    				rInput.setAttribute("data-ets", parseFloat(tempVal).toString());
    			} else {
    				if (unit == "Trip") rInput.setAttribute("data-trip", parseFloat(tempVal).toString());
    			}
    		}
    		rInput.value = parseFloat(tempVal).toString(); // to remove unnecessary zeros
    		rInput.setAttribute("data-value", parseFloat(tempVal).toString());
    		rInput.setAttribute("value", parseFloat(tempVal).toString());
    		// var unit = rowSet[k].getAttribute("data-unit");
    		if (resUnitVal != "") {
    			var resInput = rowSet[k].querySelector(".resInput");
    			resInput.innerHTML = (parseFloat(resUnitVal).toFixed(4)).toString();
    		}
    	}
    }



    function calculateRow(thisRow) {
        console.log("calculateRow triggered");
        var currentEts = 0;
       // var currentResEts = 0;

       // ETs and Trips 
        var allRowInputs = thisRow.querySelectorAll("input[data-ets]");  // does not include comm

        for(i=0; i<allRowInputs.length; i++) {
            currentEts = currentEts + parseFloat(allRowInputs[i].getAttribute("data-ets"));
          //  if(allRowInputs[i].classList.contains("residential")) currentResEts += parseFloat(allRowInputs[i].getAttribute("data-ets"));
        }

        try {
            thisRow.querySelector('.spanETs').setAttribute("data-row-ets", parseFloat(currentEts).toFixed(4));
            thisRow.querySelector(".spanETs").innerHTML = parseFloat(currentEts).toFixed(4);
          //  thisRow.querySelector('.spanETs').setAttribute("data-row-ets", parseFloat(currentEts).toFixed(4));
           // thisRow.querySelector(".spanETs").innerHTML = parseFloat(currentEts).toFixed(4);

            var trips = currentEts * thisRow.querySelector("input[data-trips]").getAttribute("data-multiplier");
            thisRow.querySelector("input[data-trips]").setAttribute("data-trips",trips);
            thisRow.querySelector("input[data-trips]").setAttribute("value",trips);
            thisRow.querySelector("input[data-trips]").value = parseFloat(trips).toFixed(4);


            

        } catch (ex) {
            console.log('skipping ');
        }

        calculateTotals(thisRow);
    
    }

    function calculateTotals(thisRow) {
    	var parentStage = thisRow.parentNode.parentNode.parentNode.parentNode;
    	 console.log("parentStageID:" + parentStage.id);
         console.log(parentStage);
    	// calc ets
    	var totalComEts = 0; //for cp18 conversion
    	var totalResEts = 0;
    	var totalETs = 0;
    	var allETRows = parentStage.querySelectorAll("span[data-row-ets]"); //does not include comm
    	if(debug) console.log("ALL ET ROWS:");
    	if(debug) console.log(allETRows);
    	for (i = 0; i < allETRows.length; i++) {
    		if(debug) console.log("adding stuffup:" + allETRows[i].id);
    		totalETs += parseFloat(allETRows[i].getAttribute("data-row-ets"));
    		if (allETRows[i].classList.contains("residential")) totalResEts += parseFloat(allETRows[i].getAttribute("data-row-ets"));
    		//   if(allETRows[i].classList.contains("txtETsCom")) totalComEts += parseFloat(allETRows[i].getAttribute("data-ets"));
    	}
    	//    console.log("cp18 comm ETs:" + totalComEts);
    	parentStage.querySelector(".totalEts").innerHTML = parseFloat(totalETs).toFixed(4);
    	parentStage.querySelector(".totalResEts").innerHTML = parseFloat(totalResEts).toFixed(4);
    	// parentStage.querySelector(".cp18CommETs").innerHTML = parseFloat(totalComEts).toFixed(4);
    	parentStage.querySelector(".totalEts").setAttribute("data-unit", "ET");
    	parentStage.querySelector(".totalEts").setAttribute("data-res", totalResEts);
    	parentStage.querySelector(".totalHA").innerHTML = parseFloat(parseFloat(totalETs).toFixed(4) * 0.1).toFixed(4);
    	parentStage.querySelector(".totalHA").setAttribute("data-unit", "HA");
    	//console.log("allETs:"+totalETs);
    	// end ets
    	// calc trips
    	var totalTrips = 0;
    	var totalResTrips = 0;
    	var allTripRows = parentStage.querySelectorAll("input[data-trips]");
    	for (i = 0; i < allTripRows.length; i++) {
    		//   console.log(allTripRows[i].id);
    		totalTrips += parseFloat(allTripRows[i].getAttribute("data-trips"));
    		if (allTripRows[i].classList.contains("residential")) totalResTrips += parseFloat(allTripRows[i].getAttribute("data-trips"));
    	}
    	parentStage.querySelector(".totalTrips").innerHTML = parseFloat(totalTrips).toFixed(4);
    	parentStage.querySelector(".totalResTrips").innerHTML = parseFloat(totalResTrips).toFixed(4);
    	parentStage.querySelector(".totalTrips").setAttribute("data-unit", "Trip");
    	parentStage.querySelector(".totalTrips").setAttribute("data-res", totalResTrips);
    	//   console.log("allTrips:"+totalTrips);
    	// end trips
    	// calc GFAs
    	var totalGFAs = 0;
    	var totalCP18GFAs = 0;
    	var totalCP18CommETs = 0;
    	var allGFARows = parentStage.querySelectorAll("input[data-gfa]");
    	for (i = 0; i < allGFARows.length; i++) {
    		//   console.log(allGFARows[i].id);
    		totalGFAs += parseFloat(allGFARows[i].getAttribute("data-gfa"));
    		totalCP18GFAs += parseFloat(allGFARows[i].getAttribute("data-gfa")); //only CP18 has GFA as a separate levy at this stage
    	}
    	parentStage.querySelector(".totalGFA").innerHTML = parseFloat(totalGFAs).toFixed(4);
    	parentStage.querySelector(".cp18CommGFA").innerHTML = parseFloat(totalCP18GFAs).toFixed(4);
    	parentStage.querySelector(".totalGFA").setAttribute("data-unit", "m2");
    	if (totalCP18GFAs > 0) {
    		// var  ETRatio = getCP18CommercialRatio(parentStage);
    		//  console.log("ETRATIO:" + ETRatio);
    		var comETValue = parseFloat(totalCP18GFAs * ETRatio).toFixed(4);
    		parentStage.querySelector(".cp18CommETs").innerHTML = comETValue;
    		var cp18CommCells = parentStage.querySelectorAll(".cp18Comm");
    		for (i = 0; i < cp18CommCells.length; i++) {
    			cp18CommCells[i].classList.remove("hidden");
    		}
    	}
    	var totalLots = 0;
    	var resInputs = parentStage.querySelectorAll("input.lotcount:not(.hidden)");
    	for (i = 0; i < resInputs.length; i++) {
    		totalLots = parseFloat(totalLots) + parseFloat(resInputs[i].value);
    	}
    	var resETs = parseFloat(parentStage.querySelector(".totalResEts").innerHTML);
    	parentStage.querySelector(".spanNumLots").innerHTML = totalLots;
    	parentStage.querySelector('.spanNumLots').setAttribute("data-numlots", totalLots);
    	parentStage.querySelector(".spanNumEts").innerHTML = resETs;
    	parentStage.querySelector('.spanNumEts').setAttribute("data-numets", resETs);
    	if (totalLots > 0) {
    		parentStage.querySelector(".spanNumLotsDesc").innerHTML = " residential lots";
    		parentStage.querySelector(".spanNumEtsDesc").innerHTML = " residential ETs";
    	} else {
    		parentStage.querySelector(".spanNumLotsDesc").innerHTML = "";
    		parentStage.querySelector(".spanNumEtsDesc").innerHTML = "";
    	}
    	if(debug) console.log(thisRow);
    	if (guideState == "showing" && !thisRow.classList.contains("chkCapInputs")) {
    		introJs().exit();
    		startIntro();
    		// introJs().refresh();
    	}
    }

    
    
}
//** end of main function container

//*****************************
// OUTSIDE OF MAIN FUNCTION set:

function saveStatus(planList, type) {
	if(debug) console.log("saveStatus triggered");
	if(debug) console.log(planList);
	//hide all inactive first
	var inactiveRows = document.querySelectorAll(".inactive");
	var inactiveCBs = document.querySelectorAll("input.chkActive");
	for (m = 0; m < inactiveCBs.length; m++) {
		inactiveCBs[m].setAttribute("checked", "checked");
	}
	for (j = 0; j < inactiveRows.length; j++) {
		inactiveRows[j].classList.add("hidden");
	}
	var data = [];
	var data2 = [];
	var capped = false;
	var everything = document.getElementById("everything");
	var stages = document.querySelectorAll(".wholestagecontainer");
	console.log(stages[0]);

	if(debug) console.log(stages);
	for (i = 0; i < stages.length; i++) {
		var thisStage = stages[i];
		var stageName = thisStage.querySelector(".stageLabel").innerHTML;
		var effectiveDate = thisStage.querySelector(".txtEffectiveDate").value;
		var capMultiplier = parseFloat(thisStage.querySelector(".spanCapMultiplier").getAttribute("data-capmultiplier"));
		if (capMultiplier != 1) capped = true;
		//    var options = thisStage.querySelectorAll(".DevTypeRow");
		var planRows = stages[i].querySelectorAll(".planRow:not(.inactive)");
		for (k = 0; k < planRows.length; k++) {
			var dataObj = planList.filter(function(d) {
				return d['Plan Number'] == planRows[k].getAttribute("data-plannum");
			})
			dataObj1 = dataObj[0];
			// console.log(dataObj1);
			//values["rateTit
			var levyRows = planRows[k].querySelectorAll(".levyRow:not(.inactive)");
			for (j = 0; j < levyRows.length; j++) {
				var dataObj = {};
				var values = {};
				var dataObj2 = {};
				var values2 = {};
				var thisRow = levyRows[j];
				// console.log(levyRows[j].Rates);
				//   console.log(levyRows[j].getAttribute("data-unit"));                                                         
				var thisUnit = thisRow.getAttribute("data-unit");
				values["stageName"] = stageName;
				values["effectiveDate"] = effectiveDate;
				values["capMultiplier"] = capMultiplier;
				values["planNum"] = dataObj1['Plan Number'];
				values["rateTitle"] = levyRows[j].querySelector(".rateTitle").textContent;
				//values["baseRate"] =        levyRows[j].querySelector(".baseRate").textContent;
				values["baseRate"] = parseFloat(levyRows[j].querySelector('.baseRate').getAttribute("data-baserate"));
				values["unit"] = thisUnit; // why does it not change 
				values["rateAmount"] = parseFloat((levyRows[j].querySelector(".rateAmount").getAttribute("data-rate")).replace(/,/g, ''));
				values["rateInput"] = levyRows[j].querySelector("input.rateInput").value;
				values["resInput"] = levyRows[j].querySelector(".resInput").textContent;
				values["rateTotal"] = parseFloat((levyRows[j].querySelector(".rateTotal").textContent).replace(/,/g, ''));
				values["resTotal"] = parseFloat((levyRows[j].querySelector(".resTotal").textContent).replace(/,/g, ''));
				values["rateDiscountDesc"] = levyRows[j].querySelector(".rateDiscountDesc").textContent;
				values["rateDiscountLongDesc"] = levyRows[j].querySelector(".rateDiscount").getAttribute("data-discountdesc");
				values["rateDiscount"] = parseFloat((levyRows[j].querySelector(".rateDiscount").textContent).replace(/,/g, ''));
				values["ebeDiscount"] = parseFloat(levyRows[j].querySelector(".rateDiscount").getAttribute("data-discountebe"));
				values["empDiscount"] = parseFloat(levyRows[j].querySelector(".rateDiscount").getAttribute("data-discountemp"));
				values["ebeDiscountAmount"] = values.ebeDiscount > 0 ? parseFloat((levyRows[j].querySelector(".rateDiscount").getAttribute("data-discountebeamount")).replace(/,/g, '')) : "";
				values["empDiscountAmount"] = values.empDiscount > 0 ? parseFloat((levyRows[j].querySelector(".rateDiscount").getAttribute("data-discountempamount")).replace(/,/g, '')) : "";
				values["rateDiscountedTotal"] = parseFloat((levyRows[j].querySelector(".rateDiscountedTotal").textContent).replace(/,/g, ''));
				values["rateCapAdjust"] = parseFloat(levyRows[j].querySelector(".rateCapAdjust").textContent.replace(/[,\(\)]/g, ''));
				//values["rateCapAdjust"] = parseFloat(levyRows[j].querySelector(".rateCapAdjust").getAttribute("data-capadjust"));
				values["rateCappedTotal"] = parseFloat((levyRows[j].querySelector(".rateCappedTotal").textContent).replace(/,/g, ''));
				values["rateAppliesTo"] = levyRows[j].querySelector(".rateAppliesTo").textContent;
				values["rateCC"] = levyRows[j].querySelector(".rateCC").textContent;
				values["rateAT"] = levyRows[j].querySelector(".rateAT").textContent;
				//  console.log(values.rateCapAdjust);
				dataObj[dataObj['Plan Number']] = values;
				var planNum = dataObj1['Plan Number'];
				// data.push( {[planNum]: values});
				console.log(values);
				data.push(values);
				//TODO: work out why we're getting a rogue entry for "unit" ; needed to add in 'Unit' to counteract
				var desc = "per " + values.unit;
				if (values.unit == "Trip") {
					desc = "trip ends incl Admin"
				}
				// var reduction = parseFloat(values.rateAmount) - parseFloat(values.baseRate);
				//  console.log("REDUCTION:" + reduction);
				//TODO: the way the stage heading is treated is slightly different from the
				// spreadsheet version, may need to adjust things here
				// when there are multi stages in the spreadsheet version, the header row is repeated
				values2["Stage"] = stageName;
				values2["Autotext"] = values.rateAT;
				//values2["Total"] = values.planNum != "18" ? Math.round(values.rateTotal) : values.rateTotal;
                values2["Total"] = values.rateTotal;
                //values2["Total"] = values.rateTotal;   // try not rounding
				values2["ETs/Trips/Ha"] = values.rateInput;
				//values2["pre-indexation_unit_charge_amt per lot"] = values.planNum != 18 ? Math.round(values.baseRate) : values.baseRate;
                values2["pre-indexation_unit_charge_amt per lot"] = values.baseRate;
				//values2["unit_charge_amt"] = values.planNum != 18 ? Math.round(values.rateAmount) : values.rateAmount;
                values2["unit_charge_amt"] =  values.rateAmount;
				values2["charge_comment"] = desc;
				values2["charge_type"] = values.rateCC;
				values2["Condition Comment"] = values.unit;
				//values2["Revised Total"] = values.planNum != "18" ? Math.round(values.rateCappedTotal) : values.rateCappedTotal;
				//values2["Reductions for Cap"] = values.planNum != "18" ? Math.round(values.rateCapAdjust) : values.rateCapAdjust;

                values2["Revised Total"] = values.rateCappedTotal;
				values2["Reductions for Cap"] = values.rateCapAdjust;
			


				// for discounts number first, formula second, otherwise should be empty
				values2["EMP Discount"] = values.empDiscountAmount; // TODO: calculate and enter discount info here
				values2["EMP Discount Formula"] = parseFloat(values.empDiscount) > 0 ? parseFloat(values.empDiscount) * 100 + "%" : "";
				values2["EBE Discount"] = values.ebeDiscountAmount;
				values2["EBE Discount Formula"] = parseFloat(values.ebeDiscount) > 0 ? parseFloat(values.ebeDiscount) * 100 + "%" : "";
				data2.push(values2);
				//    var levyObj = dataObj1.rates.filter(function(l) {
				//       return l.ChargeControl == levyRows[j].querySelector(".rateCC").innerHTML;
				//
				//   }) 
				//   console.log(levyObj);
			}
			// dataObj1["values"] = 
			//  data.push(dataObj[0]);
		}
	} //end main for loop: i
	var headers = ["stageName", "effectiveDate", "capMultiplier", "planNum", "rateTitle", "baseRate", "unit", "rateAmount", "rateInput", "resInput", "rateTotal", "resTotal", "rateDiscountDesc", "rateDiscountLongDesc", "rateDiscount", "discountEBE", "discountEMP", "discountEBEAmount", "discountEMPAmount", "rateDiscountedTotal", "rateCapAdjust", "rateCappedTotal", "rateAppliesTo", "rateCC", "rateAT"]
	//var headers2 = ["Stage 1","Autotext", "Total", "ETs/Trips/Ha", "pre-indexation_unit_charge_amt per lot",
	//                "unit_charge_amt", "charge_comment", "charge_type", "Condition Comment", "Revised Total", "Reductions for Cap", 
	//               "EMP Discount", "EMP Discount", "EBE Discount", "EBE Discount"];
	var headers2 = ["Stage", "Autotext", "Total", "ETs/Trips/Ha", "pre-indexation_unit_charge_amt per lot", "unit_charge_amt", "charge_comment", "charge_type", "Condition Comment", "Revised Total", "Reductions for Cap", "EMP_Discount", "EMP_Discount_formula", "EBE_Discount", "EBE_Discount_formula"];
	if(debug) console.log(data);
	if (type == "excel") {
		makeExcel(headers, data, headers2, data2);
		// makeExcel(headers, data);
	} else {
		console.log('make a word doc');
		makeWord(data, capped);
	}
}


function clearParentDiv(spHtml) {
    var tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = spHtml;
    return tmpDiv.childNodes[0].innerHTML;

}

  
function createListItem(name, text) {  

    var clientContext = new SP.ClientContext();  
    var site = clientContext.get_site();
    var oList = clientContext.get_web().get_lists().getByTitle('Infrastructure Charges Saved');  
    var itemCreateInfo = new SP.ListItemCreationInformation();  
    this.oListItem = oList.addItem(itemCreateInfo);  
    oListItem.set_item('Title', name);  
    oListItem.set_item('Body', text);  
    oListItem.update();  
    clientContext.load(oListItem);  
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));  
}  

  function onQuerySucceeded() {  

     // alert('Item created Successfully !!!!');  
      Swal.fire({
          icon: 'success',
          title: "Success!!",
          html: "Calculation saved to SharePoint at <a href='http://tscps/prac/infrastructure/Lists/Infrastructure%20Charges%20Saved/AllItems.aspx' target='_blank'>SharePoint List</a>."
      })
       
  }  

  function onQueryFailed(sender, args) {  

      alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());  
  } 





  function groupBy(OurArray, property) {  
    return OurArray.reduce(function (accumulator, object) { 
        // get the value of our object(age in our case) to use for group    the array as the array key   
        const key = object[property]; 
        // if the current value is similar to the key(age) don't accumulate the transformed array and leave it empty  
        if (!accumulator[key]) {      
        accumulator[key] = [];    
        }    
    // add the value to the array
        accumulator[key].push(object);
        // return the transformed array
    return accumulator;  
    // Also we also set the initial value of reduce() to an empty object
    }, {});
}

function makeFileName() {

    var txtDate = document.querySelector(".txtDate").getAttribute("value");
    var today = new Date();
    var todayDate = today.toISOString().split("T")[0];
    //var todayStr = today.toISOString().replace(/-/g,"").replace("_","").replace("T","").replace("Z","");

    var uniqueNum = today.toISOString().split("T")[1].replace(/:/g,"").replace(".","").replace("Z","");
  
    return txtDate ? document.title + "-" + txtDate + "-" + uniqueNum : document.title + "-" + todayDate + "-" + uniqueNum;

}

function makeWord(data, capped) {
	console.log(data);
	var saveToSP = "checked";
	var saveToSPcb = document.querySelector(".chkSaveSP");
	if (saveToSPcb) {
		if (!(saveToSPcb.getAttribute("checked"))) saveToSP = "";
	}
	console.log("saveToSP:" + saveToSP);
	console.log("capped:" + capped);
//	var condText;
/*	payload = {
		method: 'GET',
		headers: {
			"Accept": "application/json; odata=verbose"
		},
		credentials: 'same-origin' // or credentials: 'include'  
	} */
	/*fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Condition%20Text')/items", payload).then(function(response) {
		if (response.ok) {
			return response.json();
		}
	}).then(function(d) {
		records = d.d.results;
		console.log(records);
		condText = records;
	}).then(function(d2) { */
		// const groupByStage = groupBy("stageName");

		/*condText = condText.filter(function(item) {
			return condTexts
		}); */

		swal.fire({
			icon: "question",
			title: "When is payment required?",
			html: "Select an option",
			input: "radio",
			inputOptions: {
				"mustbepaid-changeofuse": "prior to oc (change of use)",
				"mustbepaid-tourism": "prior to cc (standard/tourism)",
				"mustbepaid-subdivision": "prior to sc (subdivision cert)",
				"mustbepaid-30days": "pay within 30 days"
			},
			showCancelButton: true,
		}).then(function(res) {
			if (res.value) {
				var paymentReq = res.value;
				// console.log(paymentReq);
				var groupedData = groupBy(data, "stageName");
				var gdArray = groupedData;
				var standardText = condText.filter(function(x) {
					return x.Title.trim() == "standard";
				});
				var feeTableHeaders = condText.filter(function(x) {
					return x.Title.trim() == "feesheettable";
				})[0].top;
				var feeTableColumns = condText.filter(function(x) {
					return x.Title.trim() == "feesheettable";
				})[0].Raw;
				//    console.log(feeTableColumns);
				// feeTableHeaders = clearParentDiv(feeTableHeaders);
				var feeTHjson = JSON.parse(feeTableColumns.replace(/\r?\n|\r/g, ""));
				//var feeTHjson = JSON.parse(feeTableColumns);
				//   console.log(feeTHjson);
				var paymentText = condText.filter(function(x) {
					return x.Title.trim() == paymentReq;
				})[0].top;
				var condDescriptorText = condText.filter(function(x) {
					return (x.Title.trim() == "descriptors");
				})[0].Raw;
				var tempPT = document.createElement("div");
				tempPT.innerHTML = paymentText;
				paymentText = tempPT.childNodes[0].innerHTML; // skip the sp div
				//    console.log(condDescriptorText);
				//  console.log(paymentText);
				var condDescriptors = JSON.parse(condDescriptorText.replace(/\r?\n|\r/g, ""));
				//var condDescriptors = c;
				// console.log("descriptors");
				//  console.log(condDescriptors);
				if(debug) console.log(gdArray);
				if(debug) console.log(gdArray.length);
				//make a hidden table first I think ...
				var html = "";
				var feeTableHtml = "";
				// for(k=0; k< gdArray.length; k++) {
				var prefixRec = condText.filter(function(x) {
					//  console.log(x.Title + "; " + item[i].rateAT);
					return x.Title == "S94charges"
				})
				var prefix = prefixRec[0].top;
				var suffix = prefixRec[0].bottom;
				var tmpPrefix = document.createElement("div");
				tmpPrefix.innerHTML = prefix;
				tmpPrefix.querySelector(".mustbepaid").innerHTML = paymentText;
				prefix = tmpPrefix.innerHTML;
				var tmpSuffix = document.createElement("div");
				tmpSuffix.innerHTML = suffix;
				if (capped) {
					var ministersCap = condText.filter(function(x) {
						return x.Title == "MINISTERSCAP";
					})[0].text;
					tmpSuffix.querySelector(".ministerscap").innerHTML = ministersCap;
				} else {
					tmpSuffix.querySelector(".ministerscap").innerHTML = "";
					// tmpSuffix.querySelecto
				}
				suffix = tmpSuffix.innerHTML;
				for (const stage in gdArray) {
					// console.log(gdArray[k]);
					// var newTable = "<h3>"+stage + "</h3>"+prefix+"<table>";
					var newTable = "<h3>" + stage + "</h3>" + prefix;
					//   console.log(stage);
					var newFeeTable = "<h3>" + stage + " Fee Sheet</h3>" + "<table style='font-family:Arial Narrow; font-size: 10px; border-collapse: collapse;'>";
					var feeTableHeadings = "<tr>";
					Object.keys(feeTHjson).forEach((key, index) => {
						feeTableHeadings = feeTableHeadings + "<th style='border: 1px solid silver;'>" + feeTHjson[key] + "</th>";
					});
					feeTableHeadings = feeTableHeadings + "</tr>";
					newFeeTable = newFeeTable + feeTableHeadings;
					var item = Object.values(gdArray[stage]);
					//  console.log(item);
					var tempEl = document.createElement("div");
					tempEl.innerHTML = standardText[0].top;
					tempEl.innerHTML = tempEl.childNodes[0].innerHTML; // clear the surrounding div
					//     console.log(tempEl.innerHTML);
					for (i = 0; i < item.length; i++) {
						var feeTableRow = "<tr style='border: 1px solid silver; '>";
						/*  var cText = condText.filter(function(x) {

						    //  console.log(x.Title + "; " + item[i].rateAT);
						        return x.Title.trim() == item[i].rateAT.trim();
						    }) */
						//
						var desc = condDescriptors[item[i].rateAT.trim()];
						if (item[i].rateAT.indexOf("trcpres") >= 0) desc = condDescriptors["trcpres1"];
						//    console.log("DESC:" + desc);
						//    if(cText.length > 0) {
						//  console.log(cText);
						//   console.log(cText[0].text);
						var indexDif = parseFloat(parseFloat(item[i].rateAmount) - parseFloat(item[i].baseRate)).toFixed(2).toLocaleString('en-au');
						/* var tableColCount = Object.keys(feeTHjson).length; */
						Object.keys(feeTHjson).forEach((key, index) => {
							//   console.log(key);
							//   console.log(index);
							var thisEntry = feeTHjson[key];
							//   console.log(thisEntry);
							if (key.indexOf("empty") >= 0) {
								feeTableRow = feeTableRow + "<td style='border: 1px solid silver;'>&nbsp;</td>";
							} else {
								//  console.log(item[i][key]);
								var style = " style='border: 1px solid silver;'";
								if (key == "rateAmount") style = " style='text-align: right; border: 1px solid silver;'";
								if (key == "rateCappedTotal") style = " style='text-align: right;'";
								feeTableRow = feeTableRow + "<td" + style + ">" + item[i][key] + "</td>";
							}
						});
						feeTableRow = feeTableRow + "</tr>";
						//  console.log(feeTableRow);
						//condition itself
						// console.log(item[i].planNum + ":" + item[i].rateTitle);
						//    console.log(tempEl);
						tempEl.querySelector(".condnum").innerHTML = letter(i + 1) + ".";
						tempEl.querySelector(".contdesc").innerHTML = desc;
						tempEl.querySelector(".numlots").innerHTML = (item[i].rateInput).toLocaleString('en-au');
						tempEl.querySelector(".costperlot").innerHTML = "$" + (item[i].rateAmount).toLocaleString('en-au');
						tempEl.querySelector(".per").innerHTML = item[i].unit;
						tempEl.querySelector(".topay").innerHTML = "$" + (item[i].rateCappedTotal).toLocaleString('en-au');
						tempEl.querySelector(".baserate").innerHTML = "$" + (item[i].baseRate).toLocaleString('en-au');
						tempEl.querySelector(".indexation").innerHTML = "$" + (indexDif).toLocaleString('en-au');
						tempEl.querySelector(".planname").innerHTML = "CP No. " + item[i].planNum;
						if (item[i].unit == "Trip") {
							tempEl.querySelector(".sector").innerHTML = ":" + item[i].rateTitle;
							// do something with LAC's here too
						} else {
							tempEl.querySelector(".sector").innerHTML = "";
						}
						newFeeTable = newFeeTable + feeTableRow;
						newRow = tempEl.innerHTML;
						newTable = newTable + newRow;
						//  var newRow = "<div>" +
						//  } else {
						//    newTable = newTable + "<div>NO CONDITION TEXT FOUND for item " + i + " </div>";
						//    console.log(item[i]);
						//}
					}
					newFeeTable = newFeeTable + "</table>";
					newTable = newTable + "</table>";
					html = html + newTable + suffix;
					feeTableHtml = feeTableHtml + newFeeTable;
				}
				// html.replace(/(^[\s\u200b]*|[\s\u200b]*$)/g, '');  //weird characters
				feeTableHtml = "<font family: 'Arial Narrow', Arial, sans-serif>" + feeTableHtml + "</font>";
				html = html + feeTableHtml;
				document.getElementById("wordOutput").innerHTML = html;
				var content = "<!DOCTYPE html>" + document.getElementById("wordOutput").outerHTML;
				content = content.replace(/(^[\s\u200b]*|[\s\u200b]*$)/g, '');
				content = content.replace(/[^\x00-\x7F]/g, ""); //<< this is the one that worked
				var converted = htmlDocx.asBlob(content);
				// console.log(html);
				//    var txtDate = document.querySelector(".txtDate").getAttribute("value");
				//  var today = new Date();
				//   // var calcDate = new Date(txtDate);
				//   var todayStr = today.toISOString().replace(/-/g,"").replace("_","").replace("T","").replace("Z","");
				//   var uniqueNum = today.toISOString().split("T")[1].replace(/:/g,"").replace(".","").replace("Z","");
				//  // console.log(uniqueNum);
				//  // console.log(today.toISOString().replace("T"));
				//   //var calcDateStr = calcDate ? 
				/* File Name */
				console.log(makeFileName());
				//var filename = document.title + "-"+todayStr+".docx";
				var filename = makeFileName() + ".docx";
				if (saveToSP == "checked") {
					var nodeCopy = document.getElementById("everything").cloneNode(true);
					//TODO: probably can't create something in sp, but investigate
					//createListItem(filename, nodeCopy.innerHTML);
				}
				saveAs(converted, filename);
			} // end if res.value
			else {
				return;
			};
		}); //end last then
	//}); //end of after swal.fire
	/* const doc = new docx.Document();

	 const table = new docx.Table();

	 for(i=0; i<data.length; i++) {
	     var item = data[i];

	     console.log(item);

	     let tr = new docx.TableRow({
	         children: [
	             new docx.TableCell({
	                 children: [new docx.Paragraph(item.stageName)]
	             })
	         ]
	     })

	     console.log(table);
	     

	     table.rows.push(tr);


	 }

	 doc.addSection({
	     children: [
	         new Paragraph({
	             text: "A Heading",
	             heading: HeadingLevel.HEADING_1
	         }),
	         table
	     ]
	 })

	 docx.Packer.toBlob(doc).then(blob => {
	     console.log(blob);
	     saveAs(blob, "example.docx");
	     console.log("doc created successfully");
	 }) */
}

function makeExcel(headers, data, headers2, data2) {
	// first save a record

	var saveToSP = "checked";
	var saveToSPcb = document.querySelector(".chkSaveSP");
	if (saveToSPcb) {
		if (!(saveToSPcb.getAttribute("checked"))) saveToSP = "";
	}
	var createXLSLFormatObj = [];
	var wb = XLSX.utils.book_new();
	 console.log(data);
	/* XLS Head Columns */
	//var xlsHeader = ["EmployeeID", "Full Name"];
	// var xlsHeader = headers;
	// var xlsRows = data;
	// var xlsHeader = headers2;
	// var xlsRows = data2;
	// PART THAT IS GONNA BE SUMMED
	const arr = data;
	const result = [...arr.reduce((r, o) => {
		const key = o.planNum + '-' + o.rateTitle;
		const item = r.get(key) || Object.assign({}, o, {
			//used: 0,
			// instances: 0
			//rateTitle: key,
			rateTotal: 0,
			resTotal: 0,
			rateDiscount: 0,
			ebeDiscountAmount: 0,
			empDiscountAmount: 0,
			rateDiscountedTotal: 0,
			rateCapAdjust: 0,
			rateCappedTotal: 0,
			rateInput: 0,
			resInput: 0,
			stageName: "All"
		});
		item.rateTotal += o.rateTotal;
		item.resTotal += o.resTotal;
		item.rateDiscount += o.rateDiscount;
		//if(!isNaN(o.ebeDiscountAmount)) item.ebeDiscountAmount +=  parseFloat(o.ebeDiscountAmount);
		console.log(typeof(o.ebeDiscountAmount));
		item.ebeDiscountAmount = !(isNaN(parseFloat(o.ebeDiscountAmount))) ? parseFloat(item.ebeDiscountAmount) + parseFloat(o.ebeDiscountAmount) : 0;
		//if(!isNaN(o.empDiscountAmount)) item.empDiscountAmount += parseFloat(o.empDiscountAmount);
		item.empDiscountAmount = !(isNaN(parseFloat(o.empDiscountAmount))) ? parseFloat(item.empDiscountAmount) + parseFloat(o.empDiscountAmount) : 0;
		item.rateDiscountedTotal += o.rateDiscountedTotal;
		item.rateCapAdjust += o.rateCapAdjust;
		item.rateCappedTotal += o.rateCappedTotal;
		item.rateInput += parseFloat(o.rateInput);
		item.resInput += parseFloat(o.resInput);
		return r.set(key, item);
	}, new Map).values()];
	console.log("RESULT:");
	console.log(result);
	var firstItem = result[0];
	/*
	var getKeys = function(obj) {
	    var keys=[];
	    for(var key in obj) {
	        keys.push(key);
	    }
	    return keys;
	} */
	var headers3 = Object.keys(firstItem);
	//console.log(keys);
	//console.log(Object.k)
	// MAIN PART:
	var xlsHeader;
	var xlsRows;
	var ws_name;
	for (k = 0; k < 3; k++) {
		createXLSLFormatObj = [];
		if (k == 0) {
			xlsHeader = headers2;
			xlsRows = data2;
			ws_name = "word table";
		} else if (k == 1) {
			xlsHeader = headers;
			xlsRows = data;
			ws_name = "contribution data";
		} else if (k == 2) {
			xlsHeader = headers3;
			xlsRows = result;
			ws_name = "combined";
		}
		createXLSLFormatObj.push(xlsHeader);
		document.getElementById("mainFooterTable").innerHTML = "";
		for (index = 0; index < xlsRows.length; index++) {
			value = xlsRows[index];
			var innerRowData = [];
			var vals = Object.values(value);
			for (i = 0; i < vals.length; i++) {
				innerRowData.push(vals[i]);
			}
			//console.log(innerRowData);
			createXLSLFormatObj.push(innerRowData);
		};
		var ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
		/* Add worksheet to workbook */
		XLSX.utils.book_append_sheet(wb, ws, ws_name);
	}
	console.log(createXLSLFormatObj);
	//  var today = new Date();
	//  var todayStr = today.toISOString().replace(/-/g,"-").replace("_","").replace("T","").replace("Z","");
	// var todayStr = today.toISOString().replace("_","").replace("T","").replace("Z","");
	/* File Name */
	// console.log(makeFileName());
	var itemName = makeFileName();
	var filename = itemName + ".xlsx";
	if (saveToSP == "checked") {
		// var nodeCopy = document.getElementById("everything").cloneNode(true);
		//TODO: see what can be done to save item
	//	createListItem(itemName, nodeCopy.innerHTML);
	}
	/* Sheet Name */
	// if (typeof console !== 'undefined') console.log(new Date());
	/* Write workbook and Download */
	//if (typeof console !== 'undefined') console.log(new Date());
	XLSX.writeFile(wb, filename);
	// if (typeof console !== 'undefined') console.log(new Date());
}

function getLevyRates(clear) {
	//clear it
	//TODO: either make this work independently in each stage
	// or only allow one date field
	if (clear) {
		// var threeoptions = "<select id='replaceOptions'><option>butn 1</option><button>button2</button><button>button 3</button>";
		swal.fire({
			icon: "question",
			title: "Replace plan data?",
			html: "Check date boundaries to be sure the date you have chosen is set " + "up in the Levy Rates table.<br /> For either option: click CALCULATE! after the update.",
			input: "radio",
			inputValue: 1,
			inputOptions: {
				1: "Replace rates only",
				2: "Replace whole table*"
			},
			showCancelButton: true,
			footer: "<i>* inputs and calculations will be lost </i>",
		}).then(function(result) {
			if (result.value) {
				if(debug) console.log(result.value);
				//   document.querySelector(".planContainer").innerHTML = "";
				//  getLevyRates2();
				result.value == 1 ? getLevyRates3() : getLevyRates2();
				// document.getElementById("planContainer").innerHTML = "";
			} else {
				return;
			}
		})
	} else {
		getLevyRates2();
	}
}

function getLevyRates3() {
	// this one is if we only want to update the rates, not the whole table:
	var unmatched = 0;
	chargeDate = new Date(document.querySelector(".txtDate").value);
	document.querySelector(".txtEffectiveDate").value = chargeDate.toDateInputValue();
	document.querySelector(".txtEffectiveDate").setAttribute("value", chargeDate.toDateInputValue());
	console.log("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + today.toISOString() + "' and Ended ge datetime'" + today.toISOString() + "'");
	console.log(today);
	console.log(chargeDate);
	//  console.log("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + chargeDate.toISOString() + "' and Ended ge datetime'" + chargeDate.toISOString() + "'");


/*
	fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + chargeDate.toISOString() + "' and Ended ge datetime'" + chargeDate.toISOString() + "'", payload)
		//   fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + today.toISOString() + "' and Ended ge datetime'" + today.toISOString() + "'", payload)
		.then(function(response3) {
			if (response3.ok) {
				return response3.json();
			}
		}).then(function(data3) {
*/
            tempRateData = levyRates; //TODO:  filter, then use 'activeLevyRates' 
			//tempRateData = data3.d.results;
			if(debug) console.log(tempRateData);
			if(debug) console.log(rateData);
			// get most recent rate update in this data set
			var maxDataDate = new Date(Math.max.apply(null, tempRateData.map(function(e) {
				return new Date(e.Modified);
			})));
			document.getElementById("datadate").innerHTML = " ~ rates in this set last updated " + maxDataDate.toLocaleDateString("en-au");
			for (i = 0; i < rateData.length; i++) {
				var matched = tempRateData.filter(obj => {
					//  console.log(obj);
					return obj['Plan Number'] === rateData[i]['Plan Number'] && obj.Title === rateData[i].Title && obj.ChargeControl === rateData[i].ChargeControl;
				})
				//  console.log(matched);
				var updateObj = {};
				var matched1 = matched[0];
				if (matched.length > 0) {
					updateObj = {
						"Amount": matched1.Amount,
						"BaseRate": matched1.BaseRate,
						"BaseRateDwelling": matched1.BaseRateDwelling,
						"Dwelling": matched1.Dwelling,
						"Effective": matched1.Effective,
						"Ended": matched1.Ended,
						"Plan_x0020_Version": matched1.Plan_x0020_Version,
						"Trips": matched1.Trips,
						"Per": matched1.Per,
						"Overrides": matched1.Overrides,
						"unmatched": false
					}
					//   try {
					//  } catch (ex) {
					//  console.log("error with" );
					//   console.log(rateData[i]);
					//  console.log(updateObj);
					//  }
				} else {
					unmatched++;
					updateObj["unmatched"] = true;
				}
				Object.assign(rateData[i], updateObj);
			}
			//   console.log(rateData);
			if (unmatched > 0) {
				var cutDate = chargeDate.toISOString().split("T")[0];
				var url = "http://tscps/prac/infrastructure/Lists/S94%20Levy%20Rates/Update%20Rates.aspx?FilterField1=Effective&FilterValue1=" + cutDate + "&FilterOp1=Leq&FilterField2=Ended&FilterValue2=" + cutDate + "&FilterOp2=Geq";
				Swal.fire({
					title: "Unmatched items!",
					html: "Some unmatched items found for " + chargeDate + ". Check that the <a href='" + url + "' target='_blank'> levy list</a> " + "contains all necessary data and try again.  Unmatched items may cause issue with your calculation. <br /><br />" + "In particular, check that there is an entry for each levy to be applied, and that there are values in the new columns required by the calculator: BaseRate, BaseRateDate, BaseRateDwelling, ChargeControl, ChargeMultiplier,Overrides. ",
					icon: "warning"
				})
				//TODO:  STILL COULD DO SOMETHING HERE, SOME MAY BE OK
			} else {
				// aok, a match for everything
			}
		//}).then(function() {
			updateLevyRates();
		//})
}


function updateLevyRates() {
	//  console.log("unmatched:" + numUnmatched);
	//use the existing table and update all rates:
	var allPlanRows = document.querySelectorAll(".planRow");
	if(debug) console.log("rateData:");
	if(debug) console.log(rateData);
	for (i = 0; i < allPlanRows.length; i++) {
		var planNum = parseInt(allPlanRows[i].getAttribute("data-plannum"));
		var allLevyRates = allPlanRows[i].querySelectorAll(".levyRow");
		for (k = 0; k < allLevyRates.length; k++) {
			var rateTitle = allLevyRates[k].querySelector(".rateTitle").innerHTML;
			var rateCC = allLevyRates[k].querySelector(".rateCC").innerHTML;
			//console.log(rateTitle);
			//console.log(rateCC);
			//console.log(planNum);
			var rdObj1 = rateData.filter(obj => {
				//  console.log(obj);
				/*   if(rateTitle == obj.Title && planNum == obj.['Plan Number']) 
				   {
				       console.log("match!!!");
				       console.log(rateTitle + ":" + obj.Title);
				   }  */
				return rateTitle == obj.Title && planNum == obj['Plan Number'] && obj.ChargeControl == rateCC;
			});
			// if(!rdObj) 
			rdObj = rdObj1[0];
			//console.log("Length:" + rdObj1.length);
			//console.log(rdObj.unmatched);
			if (rdObj.unmatched == false) {
				//********************************************************
				// DO ALL THE SAME STUFF WE DO WHEN WE FIRST PULL THE LIST
				// TODO: this should probably be done at a different time
				// however doing it here for now, these numbe
				//if(debug) 
                console.log("planlist:")
				//if(debug) 
                console.log(planList);
				var cp18obj = findObjectByKey(planList, "Plan Number", 18);
				//if(debug) 
                console.log("cp18obj");
                
                console.log(cp18obj);
				var cp18objRates = cp18obj.Rates;
				if(debug) console.log(cp18objRates);
				var cp181ETrate = findObjectByKey(cp18objRates, "ChargeMultiplier", "ET");
				if(debug) console.log("cp181ETrate:" + cp181ETrate);
				if(debug) console.log(rdObj);
				var CP181Et = cp181ETrate ? cp181ETrate.Amount * cp181ETrate.Dwelling : 0;
				//********************************************************
				var oneUnit = rdObj.ChargeMultiplier;
				var oneValue;
				var ETconversion = 1;
				var commStyle = "";
				if (oneUnit == "Trip") {
					oneValue = rdObj.Amount; // don't multiply it yet
				} else {
					oneValue = rdObj.Amount * rdObj.Dwelling;
				}
				// convert this to ETs for later use, CP 18 only accepts a charge in ETs
				if (oneUnit == "m2") {
					ETconversion = rdObj.Amount / CP181Et;
					//  console.log(ETconversion);
					commStyle = " commercial";
				}
				// want base rate per trip so don't want to adjust it for ET
				var oneValueBaseRate = rdObj.BaseRate; // * rateArray[k].BaseRateDwelling;
				//   console.log(rdObj);
				var baseRateUnit = oneUnit;
				// if (oneUnit == "Trip") baseRateUnit = "ET";
				var overRides = rdObj.Overrides || "";
				/*  var overRideTitle = "";
				  var overridden = "";
				  if(overRides != "") {
				      overRideTitle = " title='Overrides plan "+overRides+"'";
				      overridden = " localPlan";
				      planList[i].local = true;
				  }  */
				//console.log("rdObj");
				// console.log(rdObj[0]);
				// updateLevyRates2(rdObj);
				var elBaseRate = allLevyRates[k].querySelector(".baseRate");
				// console.log(allLevyRates)
				//console.log(elBaseRate);
				var elAmount = allLevyRates[k].querySelector(".rateAmount");
				//var elInput     = allLevyRates[k].querySelector("input").classList.contains("rateInput")[0];
				allLevyRates[k].classList.remove("highlight");
				elBaseRate.setAttribute("data-baserate", oneValueBaseRate);
				elBaseRate.innerHTML = Math.round(oneValueBaseRate * 100) / 100 + " per " + baseRateUnit;
				allLevyRates[k].classList.remove("highlight");
				elAmount.setAttribute("data-rate", Math.round(oneValue * 100) / 100);
				elAmount.setAttribute("data-1ETmultiplier", ETconversion);
				elAmount.innerHTML = Math.round(oneValue * 100) / 100 + " per " + oneUnit;
			} else {
				allLevyRates[k].classList.add("highlight");
				// allLevyRates[k].classList.add("highlight");
			}
		}
	}
}

//function updateLevyRates2(obj) {
 //   console.log(obj);


//}

async function getLevyRates2() {
	today = new Date();
	chargeDate = new Date(document.querySelector(".txtDate").value);
	document.querySelector(".txtEffectiveDate").value = chargeDate.toDateInputValue();
	document.querySelector(".txtEffectiveDate").setAttribute("value", chargeDate.toDateInputValue());
	console.log("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + today.toISOString() + "' and Ended ge datetime'" + today.toISOString() + "'");
	console.log(today);
	console.log(chargeDate);
	console.log("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('S94%20Levy%20Rates')/items?$filter=Effective le datetime'" + chargeDate.toISOString() + "' and Ended ge datetime'" + chargeDate.toISOString() + "'");



           // rateData = levyRates; // TODO: filter then use activeLevyRates

    console.log(levyRates[0]);

    rateData = await getRateData(chargeDate, levyRates).then((rateData) => {



            //});



            console.log("filtered rateData");
            console.log(rateData);

			if(debug) console.log("ratedata:");
			if(debug) console.log(rateData);
			// get most recent rate update in this data set
			var maxDataDate = new Date(Math.max.apply(null, rateData.map(function(e) {
                //TODO: add back 'modified' date to data set
				return Date.parse(e.Modified) ? new Date(Date.parse(e.Modified)) : new Date();
			})));
			document.getElementById("datadate").innerHTML = " ~ rates in this set last updated " + maxDataDate.toLocaleDateString("en-au");
			console.log("maxDataDate:" + maxDataDate);
			// do sector stuff here?
			//first add the sector data
			for (k = 0; k < rateData.length; k++) {
				if (rateData[k]['Plan Number'] == 4) {
					//  console.log(rateData[k]);
					var rateTitle = rateData[k].Title;
					var sector = rateTitle.split("-")[0];
					if (rateTitle.indexOf("LAC") < 0) { // DON'T PUT A SECTOR ONTO AN LAC ENTRY
						rateData[k]["sector"] = sector;
						// rateArray[k]["sector"] = sector;
						// planList[i].Rates[k]["sector"] = sector;  // try to perma save it here
					} else {
						rateData[k]["sectorlac"] = sector;
						//var matchingSectors = findObjectByKey(rateData,"Title");
					}
				}
			}
			// next redo the sector Amounts - LAC is two values
			for (m = 0; m < rateData.length; m++) {
				if (rateData[m]['Plan Number'] == 4) {
					if (rateData[m].sectorlac) {
						var rateTitle = rateData[m].Title;
						var sector = rateTitle.split("-")[0];
						var tempAmt = rateData[m].Amount;
						var matchingSectors = findObjectByKey(rateData, "sector", sector);
						// console.log("Matching sectors:");
						// console.log(matchingSectors);
						// console.log("LAC amount: " + parseFloat(tempAmt).toString() + "; matched amount:" + parseFloat(matchingSectors.Amount).toString());
						// do it only if the LAC value is higher, that is, in future people may enter the values separately
						if (tempAmt > matchingSectors.Amount) {
							rateData[m].Amount = tempAmt - matchingSectors.Amount;
							rateData[m].BaseRate = rateData[m].BaseRate - matchingSectors.BaseRate;
						}
					}
				}
			}
			for (i = 0; i < planList.length; i++) {
				var rates = rateData.filter(function(rate) {
					return rate['Plan Number'] == planList[i]['Plan Number'];
				})
				var k = 0;
				var j = 0;
				var devTypes = [];
				 // console.log(rates);
				for (k = 0; k < rates.length; k++) {
					// console.log(rates["Applies_x0020_to"]);
                   // console.log(rates[k]["Applies to"]);
					if (rates[k]["Applies to"]) {
						for (j = 0; j < rates[k]["Applies to"].length; j++) {
							//   console.log(rates[k].Applies_x0020_to.results[j]);
							var newVal = rates[k]["Applies to"][j];
							// avoid duplicates
							if (devTypes.indexOf(newVal) === -1) devTypes.push(newVal);
							//  devTypes.push(newVal);
							// console.log(rates);
						}
					}
					// devTypes.push(rates.Applies_x0020_to);
				}
				//   console.log(devTypes);
				planList[i]["Rates"] = rates;
				planList[i]["DevTypes"] = devTypes;
			}
	//	}).then(function() {
			//console.log("planList in getLevyRates2");
			//console.log(planList);
			html = "";
			var cp18obj = findObjectByKey(planList, "Number", 18);
            console.log("cp18obj:");
			 console.log(cp18obj);
			var cp18objRates = cp18obj.Rates;
			// console.log(cp18objRates);
			var cp181ETrate = findObjectByKey(cp18objRates, "ChargeMultiplier", "ET");
			//  console.log(cp18Erates);
			//  var CP181Et = 0;
			var CP181Et = cp181ETrate ? cp181ETrate.Amount * cp181ETrate.Dwelling : 0;
			//     console.log(CP181Et);
		

			for (i = 0; i < planList.length; i++) {
			//	console.log("Plan Number:" + planList[i].Number);
				if(!(excludedPlans.includes(planList[i]["Number"]))) {
				//if(planList[i]["Number"] != 0) {
				var rateText = "";
				var rateArray = planList[i].Rates;
				rateText = "<div class='rateContainer'>"; //removed id='rateContainer' < there is  more than one
				planList[i]["local"] = false;
				for (k = 0; k < rateArray.length; k++) {
					var oneUnit = rateArray[k].ChargeMultiplier;
					var oneValue;
					var ETconversion = 1;
					var commStyle = "";
					if (oneUnit == null) {
						console.error("null unit found-" + rateArray[k].CombinedForLookup);
						var cutDate = chargeDate.toISOString().split("T")[0];
						var url = "http://tscps/prac/infrastructure/Lists/S94%20Levy%20Rates/Update%20Rates.aspx?FilterField1=Effective&FilterValue1=" + cutDate + "&FilterOp1=Leq&FilterField2=Ended&FilterValue2=" + cutDate + "&FilterOp2=Geq";
						Swal.fire({
							title: "Incomplete Data",
							html: "Levy data exists for the chosen date, however essential fields are yet to be completed, please fix and try again.  Check console (F12) for details.<br />" + "link: <a href='" + url + "'+ target='_blank'>Levy List</a>",
							icon: "warning"
						})
						oneValue = 0;
					} else {
						if (oneUnit == "Trip") {
							oneValue = rateArray[k].Amount; // don't multiply it yet, but get its sector
						} else {
							oneValue = rateArray[k].Amount * rateArray[k].Dwelling;
						}
					}
					// convert this to ETs for later use, CP 18 only accepts a charge in ETs
					if (oneUnit == "m2") {
						ETconversion = rateArray[k].Amount / CP181Et;
						console.log(ETconversion);
						commStyle = " commercial";
					}
					//do something special for LAC trip rates - take the full amount and subtract the sector amount from it - both rates will be required
					var sectorData = "";
					var lacData = "";
					if (oneUnit == "Trip") {
						if (rateArray[k].sectorlac) {
							lacData = " data-lac='" + rateArray[k].sectorlac + "'";
						} else {
							sectorData = " data-sector='" + rateArray[k].sector + "'";
						}
					}
					// want base rate per trip so don't want to adjust it for ET
					var oneValueBaseRate = rateArray[k].BaseRate; // * rateArray[k].BaseRateDwelling;
					var baseRateUnit = oneUnit;
					// if (oneUnit == "Trip") baseRateUnit = "ET";
					var overRides = rateArray[k].Overrides || "";
					var overRideTitle = "";
					var overridden = "";
					if (overRides != "") {
						overRideTitle = " title='Overrides plan " + overRides + "'";
						overridden = " localPlan";
						planList[i].local = true;
					}
					// a little table inside the bigger one
					rateText += "<div class='tr levyRow" + overridden + commStyle 
                    + "' data-unit='" + oneUnit + "' data-overrides='" + overRides + "'" 
                    + overRideTitle + sectorData + lacData + ">" + "<div class='td rateTitle'>" 
                        + rateArray[k].Title + "</div>" + "<div class='td baseRate extra hidden' data-baserate='" 
                        + oneValueBaseRate + "'>" + Math.round(oneValueBaseRate * 100) / 100 + " per " 
                        + baseRateUnit + "</div>" + "<div class='td rateAmount' " + "data-rate='" 
                        + Math.round(oneValue * 100) / 100 + "'" + " data-1ETmultiplier='" + ETconversion + "'" 
                        + ">" + Math.round(oneValue * 100) / 100 + " per " + oneUnit + "</div>" 
                        + "<div class='td rateInput'><input type='text' class='rateInput' value=0 /> " 
                            + oneUnit + "s</div>" + "<div contenteditable=true class='td resInput cap hidden'><span>0</span></div>" 
                            + "<div class='td resTotal cap hidden'><span>0</span></div>" + "<div class='td rateTotal'><span>0</span></div>" 
                            + "<div class='td rateDiscountDesc discount hidden'><span></span></div>" 
                            + "<div class='td rateDiscount discount hidden'><span>0</span></div>" 
                            + "<div class='td rateDiscountedTotal discount hidden'><span>0</span></div>" 
                            + "<div class='td rateCapAdjust cap hidden'>0</div>" 
                            + "<div class='td rateCappedTotal discount'><span>0</span></div>" 
                            + "<div class='td rateAppliesTo extra hidden'>" 
                                //TODO: PUT RATES IN rateArray; check what Applies_x0020_to.results is now 
                                + rateArray[k]["Applies to"].toString().replace(/,/g, ', ') + "</div>" 
                                + "<div class='td rateCC extra hidden' data-cc='" + rateArray[k].ChargeControl + "'>" 
                                + rateArray[k].ChargeControl + "</div>" + "<div class='td rateAT extra hidden'>" 
                                + rateArray[k].Autotext + "</div>" + "</div>"
				}
				rateText += "</div>";
				var prefix = "CP" + ("00" + planList[i]['Plan Number']).substr(-2, 2); //pad with 1 zero
				//console.log(prefix);
				var rowLocal = "";
				if (planList[i].local == true) rowLocal = " localPlan";
				html += "<div class='tr planRow inactive" + rowLocal + "' title='" + planList[i].Title + "' " + "data-plannum='" + planList[i]['Plan Number'] + "' " + "data-devtypes='" + planList[i].DevTypes.toString() + "' " +
					// "data-devtypes='"+ planList[i].Title +"' " +
					"data-prefix='" + prefix + "'" +
					//  moreAtts +
					">";
				html += "<div class='td planPrefix'>" + prefix + "</div>";
				html += "<div class='td planTitle'>" + planList[i].Title + "</div>";
				html += "<div class='td'>" + rateText + "</div>";
				html += "</div>";
			} else {
				//ignore plan 0
				if(debug) console.log("ignoring");
				if (debug) console.log(planList[i]);
			}
		}
			var tableSubHeading = "<div class='table'>" + "<div class='tr rowHeading'>" + "<div class='td rateTitle'>Levy</div>" + "<div class='td baseRate extra hidden'>Base Rate</div>" + "<div class='td rateAmount'>Rate</div>" + "<div class='td rateInput'>Input</div>" + "<div class='td resInput cap hidden'>Res</div>" + "<div class='td resTotal cap hidden'>Res Total $</div>" + "<div class='td rateTotal'>Total $</div>" + "<div class='td rateDiscountDesc discount hidden'></div>" + "<div class='td rateDiscount discount hidden'>Discount</div>" + "<div class='td rateDiscountedTotal discount hidden'>Discounted Total $</div>" + "<div class='td rateCapAdjust cap hidden'>Cap Adj $</div>" + "<div class='td rateCappedTotal discount'>Total to Pay $</div>" + "<div class='td rateAppliesTo extra hidden'>Applies to</div>" + "<div class='td rateCC extra hidden'>Charge Control</div>" + "<div class='td rateAT extra hidden'>Autotext</div>" + "</div></div>";
			var tableSubFooter = "<div class='table totalFooter'>" + "<div class='tr rowHeading'>" + "<div class='td rateTitle'></div>" + "<div class='td baseRate extra hidden'></div>" + "<div class='td rateAmount'></div>" + "<div class='td rateInput'></div>" + "<div class='td resInput cap hidden'></div>" + "<div class='td resTotal stageResidentialTotal cap hidden'>0</div>" + "<div class='td rateTotal  stageGrandTotal'>0</div>" + "<div class='td rateDiscountDesc discount hidden'></div>" + "<div class='td rateDiscount stageTotalDiscount discount hidden'>0</div>" + "<div class='td rateDiscountedTotal stageDiscountedTotal discount hidden'>0</div>" + "<div class='td rateCapAdjust stageCapAdjust cap hidden'>0</div>" + "<div class='td rateCappedTotal stageCappedTotal discount'>0</div>" + //show this if there was a discount and no capping anyway
				"<div class='td rateAppliesTo extra hidden'></div>" + "<div class='td rateCC extra hidden'></div>" + "<div class='td rateAT extra hidden'></div>" + "</div></div>";
			var tableHeading = "<div class='tr rowHeading'>" + "<div class='td planPrefix'>Plan</div>" +
				//  "<div class='td'></div>"+
				"<div class='td'>Title</div>" + "<div class='td'>" + tableSubHeading + "</div>" + "</div>";
			var tableFooter = "<div class='tr rowHeading'>" + "<div class='td planPrefix'></div>" +
				//  "<div class='td'></div>"+
				"<div class='td'></div>" + "<div class='td'>" + tableSubFooter + "</div>" + "</div>";
			html = tableHeading + html + tableFooter;
			document.querySelector(".planContainer").innerHTML = html;
			// TODO: maybe do the LAC stuff here?  really would like to do it earlier tho
			if (hintState == "showing") {
				addHints();
			}

		}).then(function() {
			SortData("data-prefix", "planContainer");
			// then move total back to the bottom
			var totalRow = document.querySelector(".totalFooter").parentNode.parentNode;
			document.querySelector("#planContainer").appendChild(totalRow);
		});
	
}


function cp18Shenanigans(levyRow){

    var planCont = levyRow.parentNode.parentNode.parentNode.parentNode;
    var parentRow = levyRow; //ev2.target.parentNode.parentNode;

    var unit = parentRow.getAttribute("data-unit");
    console.log("UNIT:" & unit);
    if(unit == "m2") {

        var plan18Row = planCont.querySelector("[data-plannum='18']");
        // get all active GFA input vals
        var allGFAInputRows = plan18Row.querySelectorAll("[data-unit='m2']:not(.inactive)");
       // console.log(allGFAInputRows);
        var GFAVal = 0;
        var newVal = 0;
        

        for (k=0; k<allGFAInputRows.length; k++) {
         //   console.log(k);
            var gfaInput = allGFAInputRows[k].querySelector("input.rateInput");
            GFAVal = gfaInput.value;
            var multiplier = allGFAInputRows[k].querySelector(".rateAmount").getAttribute("data-1etmultiplier");
            newVal = (parseFloat(newVal) + ((parseFloat(multiplier) * parseFloat(GFAVal)))).toFixed(5);

        //    console.log(newVal);

        }


        var plan18ETLevyRow = plan18Row.querySelector("[data-unit='ET']");
        var plan18ETInput = plan18ETLevyRow.querySelector("input.rateInput");
       // var plan18ETResInput = plan18ETLevyRow.querySelector(".resInput").textContent;
        var existingResValue = parseFloat(plan18ETLevyRow.querySelector(".resInput").textContent);
       //   console.log("existingResValue:" + existingResValue);
       //   console.log("existingResValueNum:" + parseFloat(existingResValue));
        // console.log(plan18ETInput);
        var originalETs = plan18ETInput.value;

        if(originalETs > 0) {
            //   alert("overwriting ET value with conversion from GFA");
            // alert happens too much 
        }
      //  var oneEtMulti = getCP18CommercialRatio(planCont);
        // console.log("ONEMULTI:" + oneEtMulti);
        newVal = parseFloat(newVal) + parseFloat(existingResValue); //finally add any res ET

      //  console.log("newVal:" + newVal);
        plan18ETInput.value = newVal;
        plan18ETInput.setAttribute("data-ets", newVal);
        plan18ETInput.setAttribute("value", newVal);
        plan18ETInput.setAttribute("data-value", newVal);
    }
}


function getCP18CommercialRatio(wholeStage) {

    // can be wholestage or plancontainer, doesn't matter

    var cp18PlanRow = wholeStage.querySelector("[data-plannum='18']");


    var cp18LevyRowsMulti = cp18PlanRow.querySelectorAll("[data-1etmultiplier]:not(.inactive)");

    var total1ETMultiplier = 0;

    for (i=0; i< cp18LevyRowsMulti.length; i++) {
       // console.log(cp18LevyRowsGFA[i]);
       var thisInput = cp18LevyRowsMulti[i];
       if(debug) console.log(thisInput.getAttribute("data-1etmultiplier"));
       if(thisInput.getAttribute("data-1etmultiplier") != "1" && !(thisInput.parentNode.classList.contains("inactive")) ) {

       total1ETMultiplier = total1ETMultiplier + parseFloat(thisInput.getAttribute("data-1etmultiplier"));
       }
    }
    return total1ETMultiplier;

}



// intro options:

function startIntro(){

        var intro = introJs();
             guideState = "showing";
          intro.setOptions({
            steps: [
            /*  { 
                intro: "Hello world!"
              }, */
              {
                element: document.querySelector('.DevTypeSelections'),
               intro: "<strong>Start here! </strong><br /> Check one or more options relevant to the development. Each option has inputs which you will need to fill in with the number of lots, dwellings, trips and/or gfa. ",
               position: "top"

              },
              {
                element: document.querySelectorAll('.chkCapInputs')[0],
                intro: "<strong>For residential development only ...</strong><br />Enter the applicable cap value ~ the calculator will work out whether a cap applies or not.  The \'Apply Cap\' checkbox will check itself automatically if needed. ",
              /*  position: 'right' */
              },
              {
                element: '.dateSection',
                intro: "<strong>Check the date: </strong><br /> By default, the calculator will use 'today'.  Previously saved calculations will display the original calculation date until you change it.  Enter an alternative date to calculate past or future contributions.<br />" +
                        "<br /><br > <i>NB: Rates before July 2020 exist, however they may need additional data added to them, see admin if you get a warning about incomplete data.</i> ",
               /* position: 'left' */
              },
              {
                //element: '#availablePlansHeading',
                element: ".planContainer",
                scrollTo: "tooltip",
                intro: "<strong>Review plans below: </strong><br /> " +
                        "Options you chose above 'activate' default plans and levies below - " +
                        "adjust these now by double-clicking plans and/or levies ~ plans and levies not applicable to this development should appear greyed out.<br /><i>If TRCP applies, activate one sector, otherwise disable CP04 entirely.</i>",
              },
              {
                  element: '.btnAutofill',
                  intro: 'Click to autofill levy inputs below with Ets/GFAs/trips from this table.',

              },
              {
                  element: '.btnCalculate',
                  intro: 'Click the \'CALCULATE!\' button to complete the calculation.  If a cap is applicable, you will be prompted to click \'CALCULATE!\' a second time to apply it.'
              }, 
              {
                  element: '#mainFooter',
                  intro: 'Save your calculation. '
              }
            ]
          
          });

        /*  intro.onhintsadded(function() {
              console.log('all hints added');
          });

          intro.onhintclick(function(hintElement, item, stepId) {
              console.log('hint clicked', hintElement, item, stepId);
          }); */

          intro.oncomplete(function(){
            console.log("intro complete");
            localStorage.setItem("guideState", "hidden");
            guideState = "hidden";

          }); 
          intro.onexit(function () {
              console.log('intro exited');
              localStorage.setItem("guideState", "hidden");
              guideState = "hidden";
          });

         // intro.addHints();   
         try {   
          intro.start();
         } catch (ex) {};
 
 
}


function startComGuide() {
	var comGuide = introJs();
	// comGuideState = "showing";
	comGuide.setOptions({
		steps: [
			/*  { 
			    intro: "Hello world!"
			  }, */
			{
				element: document.querySelector('.chkComDiv'),
				intro: "<strong>Commercial calculation guide ... check this! </strong><br /> Check the Commercial option to display relevant inputs, and to include a commercial component in this calculation.  <br /><br /><i class=\'highlightGuideText\'>See the next guide step BEFORE completing the GFA field.</i> ",
				position: "top"
			}, {
				scrollTo: "tooltip",
				// element: document.querySelector('[data-plannum=\'18\'] > .rateContainer'),
				// TODO: this is quite risky, if the number of plan rows before 18 changes in future - can i make it more robust?
				// element: document.querySelectorAll('.rateContainer')[12],
				element: '[data-plannum=\'18\'] .td .rateContainer',
				intro: '<strong>Before entering the GFA .. </strong><br />' + 'Deactivate the GFA levies which DO NOT apply by double-clicking.  ' + '<br/><br /><i>Leave the Residential/Tourist ET row active, even if there is no residential component. This is required because CI is set up to only accepts ETs for CP18.</i> '
			}, {
				element: document.querySelector('.txtGFACom'),
				intro: "<strong>Enter the GFA</strong><br />Note that this is the GFA pertaining to CP18 only.  This number will be converted into ETs for inputting into CI.",
				/*  position: 'right' */
			}, {
				element: '.txtTripsCom',
				intro: "<strong>Enter commercial trips: </strong><br /> The number of commercial TRCP trips must be calculated separately and entered manually - refer to the contribution plan, or Council's Traffic Engineer. ",
				/* position: 'left' */
			}, {
				//element: '#availablePlansHeading',
				element: ".chkEmpDiscount",
				// scrollTo: "tooltip",
				intro: "<strong>\'Employment generating business\'?</strong><br /> " + "Check this if the \'employment generating business\' discount applies." + "<br /><br /><i>More information in CP18 and CP 04 - see Council's <a href='https://www.tweed.nsw.gov.au/Business/SupportServices' target='_blank'>Business Investment Policy</a> for details.</i>",
			}, {
				element: '.chkEBEDiscount',
				intro: "<strong>\'Eligible Business Enterprise\'?</strong><br /> " + "Check this if the \'eligible business enterprise\' discount applies." + "<br /><br /><i>More information in CP18 and CP04 - see Council's <a href='https://www.tweed.nsw.gov.au/Business/SupportServices' target='_blank'>Business Investment Policy</a> for details.</i>",
			}, {
				element: '.txtETsCom',
				intro: 'The GFA you entered is converted into ETs for each of the active CP18 GFA levy rows. ' + '<br /><br /><i>If you haven\'t deactivated GFA levies below that AREN\'T applicable to this calculation, do that now, then re-enter the GFA in this section, to recalculate and record the \'true\' ET figure here.</i> '
			}, {
				element: '.actionTable',
				intro: 'Calculated ETs are recorded here in their own \'CP 18 Commercial\' column, they are not added into the \'All\' column, because they will only apply to CP18 and aren\'t relevant to other plans. '
			}, {
				element: '[data-plannum=\'23\'] .td .rateContainer',
				intro: '<strong>Unsupplied parking spaces?</strong><br />If relevant to this development, activate CP23 and the relevant levy (double-click), then enter the number of required spaces directly into the calculator input for the levy'
			}, {
				element: '.btnAutofill',
				intro: 'From here the process is the same as for any calculation .. click auto-fill now, or add residential elements, then click \'CALCULATE!\''
			}
		]
	});
	/*  intro.onhintsadded(function() {
	      console.log('all hints added');
	  });

	  intro.onhintclick(function(hintElement, item, stepId) {
	      console.log('hint clicked', hintElement, item, stepId);
	  }); */
	comGuide.oncomplete(function() {
		console.log("com guide complete");
		// localStorage.setItem("guideState", "hidden");
		//guideState = "hidden";
	});
	comGuide.onexit(function() {
		console.log('com guide exited');
		//alert("ended");
		Swal.fire({
			icon: "question",
			title: "Show the guide next time?",
			html: "Click 'Yes' to show the guide next time you check the commercial option.  (You can start the guide manually by clicking the \'Show Commercial Guide\' button above). ",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "No"
		}).then((result) => {
			if (result.value == undefined) {
				comGuideState = "hide";
				localStorage.setItem("comGuideState", "hide");
			} else {
				localStorage.setItem("comGuideState", "show");
				comGuideState = "show";
			}
			console.log(result.value);
		})
		// localStorage.setItem("guideState", "hidden");
		// guideState = "hidden";
	});
	// intro.addHints();      
	comGuide.start();
}




function addHints() {
  	var hints = introJs();
  	hints.setOptions({
  		hints: [{
  			element: document.querySelector('#descHelpIcon'),
  			/* intro: "<strong>Start here! </strong><br /> Check one or more options relevant to the development. Each option has inputs which you will need to fill in with the number of lots, dwellings, trips and/or gfa. ", */
  			hint: 'Enter the development description here',
  			hintPosition: 'top-left'
  		}, {
  			element: '.dateAndClone',
  			hint: 'This table contains current calculations from chosen stage options and inputs, can be manually over-typed if necessary.',
  			hintPosition: 'top-middle'
  		}, {
  			element: "#stageLabel",
  			hint: "Leave as-is or change to suit the development, especially if multi-stage.",
  			hintPosition: 'top-left'
  		}, {
  			element: ".rateInput",
  			hint: "Inputs below can be typed manually"
  		}]
  	});
  	hints.onhintsadded(function() {
  		console.log('all hints added');
  	});
  	hints.onhintclick(function(hintElement, item, stepId) {
  		console.log('hint clicked', hintElement, item, stepId);
  		console.log(item.targetElement.getAttribute("data-helpid"));
  		/*  var pageId = item.targetElement.getAttribute("data-helpid");
  		    if(pageId) {
  		        helpPopup(pageId);
  		    } */
  	});
  	hints.onhintclose(function(stepId) {
  		console.log('hint closed', stepId);
  	});
  	hints.addHints();
  	//  intro.start();
      //document.querySelector('#s4-workspace').addEventListener('scroll', function(e) {
  	document.addEventListener('scroll', function(e) {
  		//  console.log(e);
  		try {
  			hints.refresh();
  		} catch (ex) {};
  	});
  }   

function toggleHints() {
	console.log("togglehints");
	var allHints = document.querySelectorAll(".introjs-hint");
	var hiddenHints = document.querySelectorAll(".introjs-hidehint");
	if (allHints.length == hiddenHints.length) {
		addHints();
		introJs().showHints();
		localStorage.setItem("hintState", "showing");
	} else {
		introJs().hideHints();
		localStorage.setItem("hintState", "hidden");
	}
}
   
function showGuide() {
    console.log("showguide");

    startIntro();
}

    
function importCalc() {
	var retrievedItems;
	var inputOptions = {};
	payload = {
		method: 'GET',
		headers: {
			"Accept": "application/json; odata=verbose"
		},
		credentials: 'same-origin' // or credentials: 'include'  
	}
	//?$filter=Current_x0020_Version_x0020_Stat eq 'Adopted'
	fetch("http://tscps/prac/infrastructure/_api/web/lists/GetByTitle('Infrastructure Charges Saved')/items?$orderby=Modified desc", payload).then(function(response) {
		if (response.ok) {
			return response.json();
		}
		//  }).then(async function(data){
	}).then(function(data) {
		//    console.log(data);
		html = "";
		records = data.d.results;
		console.log(records);
		retrievedItems = records;
		var optionList = document.createElement("select");
		var html = "";
		for (i = 0; i < records.length; i++) {
			inputOptions[i] = records[i].Title;
			// optionList.options[optionList.options.length] = new Option (records[i].Title, records[i].Title);
		}
		// console.log(inputOptions);
		// }).then(async function () {  //use either async/await **OR** nested 'then', don't need both
		// async await was ok in Chrome, but had to remove it for Edge
	}).then(function() {
		console.log("again");
		//  console.log(records)
		console.log(inputOptions);
		// const {value: calculation } =  await Swal.fire({
		const {
			value: calculation
		} = Swal.fire({
			title: "Select a saved calculation ..",
			input: 'select',
			//html: "soon will be able to import a saved calc from <a href='http://tscps/prac/infrastructure/Lists/Infrastructure%20Charges%20Saved/AllItems.aspx' target='_blank'>here</a>"
			inputOptions: inputOptions,
			inputPlaceholder: 'select a calculation',
			showCancelButton: true,
			inputValidator: (value) => {
				return new Promise((resolve) => {
					//resolve();
					console.log(value);
					console.log(retrievedItems[parseInt(value)]);
					var newSection = retrievedItems[parseInt(value)];
					// tempCopy = document.createElement("div");
					// tempCopy.innerHTML = newSection;
					if (newSection) {
						// var body
						// works, but need to be a bit cleverer about it
						document.getElementById("everything").innerHTML = newSection.Body;
						var innerDivHtml = document.getElementById("everything").childNodes[0].innerHTML;
						console.log(document.getElementById("everything").childNodes[0]);
						var htmlNodes = document.getElementById("everything").childNodes[0].childNodes;
						document.getElementById("everything").childNodes[0].remove();
						document.getElementById("everything").innerHTML = "<h1>add something back </h1>";
						console.log(htmlNodes);
						document.getElementById("everything").innerHTML = innerDivHtml;
						dragElement(document.getElementById("floatableNotes"));
						spSaveBtnState();
						//contenteditable status has disappeared on save, put it back
						document.querySelector("#calcDescription").setAttribute("contenteditable", true);
						var retrievedVersion = document.querySelector("#versionNum").innerHTML.split(" ")[1];
						console.log("retrievedVersion:" + retrievedVersion);
						if (version.toString() != retrievedVersion) {
							document.querySelector("#versionNum").innerHTML = "Version " + version + " (" + versionDate + ") - from saved calc " + document.querySelector("#versionNum").innerHTML;
						}
						var stages = document.querySelectorAll(".stageLabel");
						for (k = 0; k < stages.length; k++) {
							stages[k].setAttribute("contenteditable", true);
						}
						var summarySpans = document.querySelectorAll(".stageTotal, .stageResTotal");
						console.log(summarySpans);
						for (k = 0; k < summarySpans.length; k++) {
							summarySpans[k].setAttribute("contenteditable", true)
						}
						var resInputs = document.querySelectorAll(".resInput");
						for (k = 0; k < resInputs.length; k++) {
							resInputs[k].setAttribute("contenteditable", true);
						}
						//pick up a date change
						document.querySelector(".txtDate").onblur = function(ev) {
							console.log('date changed');
							console.log(ev.target);
							// temp skipping this as its overwriting thigns I don't want it to
							// getLevyRates(true);
						};

					}
					resolve();
				})
			}
		})
	})
}    


// Make the DIV element draggable:


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


function sortPlanNums( a, b ) {
  if ( a['Plan Number'] < b['Plan Number']){
    return -1;
  }
  if ( a['Plan Number'] > b['Plan Number'] ){
    return 1;
  }
  return 0;
}

function comparator(a, b) {
	//console.log(a.dataset.prefix);
	if (a.dataset.prefix < b.dataset.prefix)
		return -1;
	if (a.dataset.prefix > b.dataset.prefix)
		return 1;
	return 0;
}

  // Function to sort Data
  function SortData(dataEl, appendToId) {
	var subjects =
		document.querySelectorAll("[" + dataEl+"]");
		//document.querySelectorAll(dataEl);
	var subjectsArray = Array.from(subjects);
	//console.log(subjects);
	let sorted = subjectsArray.sort(comparator);
	//console.log(sorted);
	sorted.forEach(e =>
		document.querySelector("#"+appendToId).
			appendChild(e));
}

function sortData2(datEl, appendToId) {
	var items = document.QuerySelectorAll("[" + dataEl+"]");
	let sorted = items.sort(sorter);

	function sorter(a, b) {
		
	}
}


function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        //console.log(array[i][key]);
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}



async function getRateData(date, array) {


    var tempArray = array.filter(function(el) {

        var tempDate = new Date(Date.parse(el.Effective));

        var tempDate2 = moment(el.Ended, "DD/MM/YYYY");
       // console.log(el.Ended);
      //console.log(tempDate,":",tempDate2,":", date);
        return tempDate < date && (tempDate2 > date) ; //.toISOString();

        });

        return tempArray;

}









//sp/ms only
//Sys.Application.add_load(afterLoad);

document.addEventListener("DOMContentLoaded", function(event) { 
  afterLoad();
});
