(function () {
		var mSaveKey = "textarea_data_key";
		var mSaveareaObj;	// 保存エリア
		var mLoadareaObj;	// 読み込みエリア

        var mTimeLineListKey = "tlmemo_table_list_key"
        var mTimeLineIdPrefix = "tlmemo_table_name_"
        var mMemoLatestId = "tlmemo_memo_lastest_id"
        var mTLMemoLatestId = "tlmemo_timeline_latest_id"

        var mTimeLineDisplayKey = "tlmemo_timeline_disp_id"
 
		window.onload = function() {
			// ＤＯＭオブジェクトを読み込む
			mSaveareaObj = document.getElementById( "savearea" );
			mLoadareaObj = document.getElementById( "loadarea" );
            var existsTables = localStorage.getItem(mTimeLineListKey);


            if ( existsTables ) {
                var timeLineList = JSON.parse( existsTables );
                if ( Object.prototype.toString.call(timeLineList) == "[object Array]") {
                    // isArray
                    // TODO restruct data structure
                    console.log(timeLineList);
                    localStorage.setItem("old", JSON.stringify(timeLineList));
                    var newTables = {};
                    for ( var idx in timeLineList ) {
                        var newData = timeLineList[idx];
                        var titleStr = timeLineList[idx]["t"];
                        console.log(titleStr);
                        delete newData["t"];
                        newTables[titleStr] = newData;
                    }
                    console.log(newTables);
                    localStorage.setItem(mTimeLineListKey, JSON.stringify(newTables));
                }

                for ( var idx in timeLineList ) {
                    // 1:disp, 0:not disp
                    addNewTimeLine2List(timeLineList[idx]["t"], timeLineList[idx]["dsp"] == 1  );
                }
                
			    var displayTL = JSON.parse( localStorage.getItem( mTimeLineDisplayKey ) );
                for ( var idx = displayTL.length - 1 ; idx >=0 ; idx-- ) {
                    console.log(displayTL[idx]);
                    revertTimeLine( displayTL[idx] , -1);
                }
            }

            var createNewTLBtn = document.getElementById("create_new_time_line");
            createNewTLBtn.addEventListener("click", createNewTimeLine, false);

            // var saveBtn = document.getElementById("savebtn");
            // saveBtn.addEventListener("click", saveMemo, false);
		}
 
        function saveMsg(timeLineName){
            var memo = document.getElementById( "memoarea" + timeLineName ).value;
            if ( ! memo ) return;
            var memoobj = createMemoObj( memo );
            var memoid = addLocalStorage( mTimeLineIdPrefix + timeLineName , memoobj );

			var showDiv = document.getElementById( "showbox" + timeLineName );
            var msg = createMemoBox(memoobj, memoid, timeLineName);
			showDiv.insertBefore(msg, showDiv.firstChild);

            document.getElementById( "memoarea" + timeLineName ).value = "";
        }

        function addLocalStorage( timeLineId, memoobj ) {
            var original = localStorage.getItem( timeLineId );
            var saveData;
            if ( ! original ) {
                saveData = {};
            } else {
                saveData = JSON.parse(original);
            }
            var memoid = createLatestMemoId();
            saveData[memoid] = memoobj;
            // console.log(saveData);
            localStorage.setItem( timeLineId, JSON.stringify(saveData) );

            return memoid;
        }

        function createMemoObj( memo ) {
            return {"m":memo,
                "t":new Date().getTime()};
        }

        function createLatestTimeLineId () {
            var latestId = localStorage.getItem( mTLMemoLatestId );

            if ( ! latestId ) {
                latestId = 0;
            } else {
                latestId = parseInt(latestId) + 1;
            }
            localStorage.setItem( mTLMemoLatestId, latestId );

            return latestId;
        }

        function createLatestMemoId () {
            var latestId = localStorage.getItem( mMemoLatestId );

            if ( ! latestId ) {
                latestId = 0;
            } else {
                latestId = parseInt(latestId) + 1;
            }
            localStorage.setItem( mMemoLatestId, latestId );

            return latestId;
        }

		function createMemoBox(msg_obj, msg_id, timeLineName) {
			var msgbox = document.createElement("div");
            msgbox.setAttribute("class", "memobox");

			var dltbtn = document.createElement("button");
            dltbtn.setAttribute("class", "dltbtn");
			dltbtn.setAttribute("id", msg_id);
			dltbtn.addEventListener("click", (function(i){
                    return function(){
                        console.log("delete msg: " + msg_id + " in " + timeLineName); 
                    };
                })(timeLineName, msg_id), false);
			dltbtn.innerHTML = "x";

			var msgdatebox = document.createElement("div");
            msgdatebox.setAttribute("class", "datebox");
            var msg_date = new Date();
            msg_date.setTime(msg_obj.t);
			msgdatebox.innerHTML = msg_date.getFullYear()  + "/" + 
                digitFormat(msg_date.getMonth() + 1) + "/" + 
                digitFormat(msg_date.getDate()) + " " + 
                digitFormat(msg_date.getHours()) + ":" + 
                digitFormat(msg_date.getMinutes()) + ":" + 
                digitFormat(msg_date.getSeconds());
                
			var msg = document.createElement("div");
            msg.setAttribute("class", "sentence");
			msg.innerHTML = msg_obj.m;

			msgbox.appendChild(msgdatebox);
			msgbox.appendChild(dltbtn);
			msgbox.appendChild(msg);
			return msgbox;
		}

        function digitFormat(num) {
            var str = String(num);
            if ( str.length == 1) {
                return "0" + str;
            } else {
                return str;
            }
        }

        function hiddenTimeLine(timeLineName){
            var timeLine = document.getElementById( "timeline_id_" + timeLineName );
            timeLine.parentNode.removeChild(timeLine);
        }

        // タイムライン表示領域に指定IDのタイムラインを追加
        // TODO set correcto position
        function revertTimeLine( timeLineName , position) {
            // console.log("revert to " + timeLineName );
            var tlelem = createTimeLineElement( timeLineName );
            var tlwrapper = document.getElementById("tl_wrapper");

            tlwrapper.insertBefore( tlelem, tlwrapper.firstChild );
        }

        function resetTimeLinePosition() {
            var tlwrapper = document.getElementById("tl_wrapper");

            var dispObj = [];
            var displayTimeLines = tlwrapper.childNodes;
            for ( var idx = 0 ; idx < displayTimeLines.length ; idx++ ) {
                var timeLineElem = displayTimeLines.item(idx);
                if ( timeLineElem.nodeType == 1) {
                    var timeLineName = timeLineElem.id.substring("timeline_id_".length);
                    dispObj[idx] = timeLineName;
                }
            }

			localStorage.setItem( mTimeLineDisplayKey, JSON.stringify(dispObj));
        }

        // メモの入力～タイムライン表示までの要素を作成する
        function createTimeLineElement( timeLineName ){
            // mTimeLineIdPrefix + timeLineName;
            var timeLine = document.createElement("div");
            timeLine.setAttribute("class", "timeline");
            timeLine.setAttribute("id", "timeline_id_" + timeLineName);
            
            var timeLineTitle = document.createElement("h5");
            timeLineTitle.innerHTML=timeLineName;
            timeLine.appendChild(timeLineTitle);

            var timeLineInputArea = document.createElement("textarea");
            timeLineInputArea.setAttribute("id", "memoarea" + timeLineName);
            timeLineInputArea.setAttribute("placeholder", "メモの内容を記述");
            timeLine.appendChild(timeLineInputArea);

            var newline = document.createElement("br");
            timeLine.appendChild(newline);

            var timeLineSaveBtn = document.createElement("button");
            timeLineSaveBtn.setAttribute("type", "button");
            timeLineSaveBtn.setAttribute("id", "savebtn" + timeLineName);
            timeLineSaveBtn.addEventListener("click", (function(timeLineName){
                    return function(){
                        // TODO つじつまを合わせないといけない。
                        // セーブするとき…だけ？
                        saveMsg(timeLineName);
                    };
                })( timeLineName ), false);
            timeLineSaveBtn.innerHTML = "save";
            timeLine.appendChild(timeLineSaveBtn);

            var timeLineContents = document.createElement("div");
            timeLineContents.setAttribute("id", "showbox" + timeLineName);
            timeLine.appendChild(timeLineContents);

            var memodataelem = localStorage.getItem( mTimeLineIdPrefix + timeLineName )
            if ( memodataelem ) {
                var memodata = JSON.parse( memodataelem );
                for ( var idx in memodata ){
                    // TODO idを正しい値にする
			        var child = createMemoBox(memodata[idx], idx, timeLineName);
			        timeLineContents.insertBefore(child, timeLineContents.firstChild);
                }
            }

            return timeLine;
        }


        function findCheckedRadio() {
            var radios = document.getElementsByName("memo_table");

            for ( var idx in radios ) {
                if ( radios[idx].checked ) {
                    return radios[idx];
                }
            }
            return undefined;
        }

        // 
        // time line
        // 

        function createNewTimeLine() {
            // console.log("will create new time line");
            
            var tlInputElem = document.getElementById("new_time_line_name");
            if ( ! tlInputElem ) return;

            var timeLineName = tlInputElem.value;
            // console.log("create new time line : " + timeLineName);

			var text = localStorage.getItem( mTimeLineListKey );
            var keyStr;
            var newTimeLineIdx;
            if ( ! text ) {
                var keyList = {};
            } else {
                var keyList = JSON.parse(text);

                // 重複確認
                if ( keyList[timeLineName] ) {
                    console.log(keyList[idx]["t"] + " but " +  timeLineName + " found in " + idx);
                    console.log("already exists : " + timeLineName);
                    // TODO タイムラインの表示
                    return;
                }
            }
            // TODO create correct time line id
            var timeLineId = timeLineName;
            // TODO set correct position : maybe 1.
            keyList[timeLineId] = {
                    "t":timeLineName,
                    "id":createLatestTimeLineId(),
                    "dsp":1,
                    "pos":1
                };
            keyStr = JSON.stringify( keyList );
            localStorage.setItem( mTimeLineListKey, keyStr );

            tlInputElem.value = "";

            // タイムライン名をリストに追加
            addNewTimeLine2List(timeLineName, true);

            revertTimeLine(timeLineName, -1);

            resetTimeLinePosition();
        }

        // TL名のリストに新規TL名を追加する
        function addNewTimeLine2List(timeLineName, select) {
            var tlListElem = document.getElementById("time_line_list_display");
            if ( ! tlListElem ) {
                console.log("time line list display not found error");
                return;
            }

            var timeLineKey = mTimeLineIdPrefix + timeLineName;
            var timeLineList = document.createElement("div");
            timeLineList.setAttribute("id", timeLineKey);
            if ( select ) {
                timeLineList.setAttribute("class","checked");
                // TODO set correct position
                // revertTimeLine(timeLineName, -1);
            } else {
                timeLineList.setAttribute("class","unchecked");
            }

            var timeLineSwitchBtn = document.createElement("button");
            timeLineSwitchBtn.setAttribute("type", "button");
            timeLineSwitchBtn.addEventListener("click", (function(timeLineName) {
                    return function() {
                        switchTimeLine (timeLineName);
                    }
                })( timeLineName ), false);
            timeLineSwitchBtn.innerHTML = timeLineName;
            timeLineList.appendChild(timeLineSwitchBtn);

            var timeLineDeleteBtn = document.createElement("button");
            timeLineDeleteBtn.setAttribute("type", "button");
            timeLineDeleteBtn.innerHTML="X"
            timeLineDeleteBtn.addEventListener("click", (function(timeLineName) {
                    return function() {
                        deleteTimeLine(timeLineName)
                    }
                })( timeLineName ), false);
            timeLineList.appendChild(timeLineDeleteBtn);

            tlListElem.insertBefore(timeLineList, tlListElem.firstChild);
        }

        function switchTimeLine (timeLineName) {
            var titleElem = document.getElementById( mTimeLineIdPrefix + timeLineName );
            if ( ! titleElem ) return;
            if ( titleElem.className === "checked" ) {
                titleElem.setAttribute("class","unchecked");
                hiddenTimeLine(timeLineName);
                changeTitleInfoDisp(timeLineName, false, -1);
            } else {
                titleElem.setAttribute("class","checked");
                // TODO set position
                revertTimeLine(timeLineName, -1);
                changeTitleInfoDisp(timeLineName, true, -1);
            }

            resetTimeLinePosition();
        }
        

        function changeTitleInfoDisp(timeLineName, disp, position) {
            var existsTablesJSON = localStorage.getItem( mTimeLineListKey );
            if ( ! existsTablesJSON ) return;
            var existsTables = JSON.parse( existsTablesJSON );

            existsTables[timeLineName]["dsp"] = disp ? 1 : 0;
            existsTables[timeLineName]["pos"] = position;

            localStorage.setItem( mTimeLineListKey, JSON.stringify(existsTables) );
        }

        function deleteTimeLine(timeLineName) {
            console.log("delete time line : " + timeLineName);
        }
})()
