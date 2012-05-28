		var mSaveKey = "textarea_data_key";
		var mSaveareaObj;	// 保存エリア
		var mLoadareaObj;	// 読み込みエリア

        var mTableListKey = "tlmemo_table_list_key"
        var mTablePrefix = "tlmemo_table_name_"
        var mMemoLatestId = "tlmemo_memo_lastest_id"
 
		window.onload = function() {
			// ＤＯＭオブジェクトを読み込む
			mSaveareaObj = document.getElementById( "savearea" );
			mLoadareaObj = document.getElementById( "loadarea" );
            var existsTables = localStorage.getItem(mTableListKey);
            if ( existsTables ) {
                var tableList = existsTables.split("");
                for ( var idx in tableList ) {
                    addTableListDisplay(tableList[idx], (idx === 0) ? true : false);
                }
            }
 
			// イベントリスナを登録する
//			mSaveareaObj.addEventListener( "keyup", onkeyupEvent );	// 保存エリアでタイピングされたら発動
		}
 
		/**
		 * タイピングされた時のイベント処理
		 */
		function onkeyupEvent() {
//			saveLocalStorage();	// 保存
			loadLocalStorage();	// すぐさま読み込む
		}
 
		/**
		 * 保存エリアの内容をローカルストレージに保存する
		 */
		function saveLocalStorage() {
			var text = mSaveareaObj.value;
			localStorage.setItem( mSaveKey, text );
		}
 
		/**
		 * 読み込みエリアにローカルストレージの内容を読み込み、表示する
		 */
		function loadLocalStorage() {
			var text = mSaveareaObj.value;
			//var text = localStorage.getItem( mSaveKey );
	//		mLoadareaObj.value = text;
			var showDiv = document.getElementById("showbox");
			//alert(text);
			var child = createMsgBox(text, 0);
			showDiv.appendChild(child);
		}

        function saveMemo() {
            var memo = document.getElementById( "savearea" ).value;

            if ( memo === "" ) return;
            var tableName = findCheckedRadio().id;
            addLocalStorage( tableName, memo );

			var showDiv = document.getElementById("showbox");
            var msg = createMsgBox(memo, 0);
			showDiv.insertBefore(msg, showDiv.firstChild);

            document.getElementById( "savearea" ).value = "";
        }

        function addLocalStorage( tableid, memo ) {
            var original = localStorage.getItem( tableid );
            var saveData;
            if (original === "" ) {
                saveData = createSaveData( tableid, memo );
            } else {
                saveData = original + "" + JSON.stringify(createSaveData( tableid, memo ));
            }
            localStorage.setItem( tableid, saveData );
        }

        function createSaveData( tableid, memo ) {
            return {"tid":tableid,
                "m":memo,
                "t":new Date().getTime()};
        }

        function createLatestMemoId () {
            var latestId = localStorage.getItem( mMemoLatestId );

            if ( ! latestId ) {
                latestId = 0;
            } else {
                latestId = tableData[tableid] + 1;
            }
            localStorage.setItem( mMemoLatestId, latestId );

            return latestId;
        }

		function createMsgBox(text, msg_id) {
			var dltbtn = document.createElement("button");
			dltbtn.style.cssText = "border:solid 1px gray; color:gray;";
			dltbtn.setAttribute("id", msg_id);
			dltbtn.innerHTML = "x";

			var msgbox = document.createElement("div");
			msgbox.style.cssText = "border:solid 1px black; margin:5px";
			msg = document.createElement("div");
			msg.style.cssText = "width:200px; border:solid 1px black;float:left";
			msg.innerHTML = text;
			msgbox.appendChild(msg);
			msgbox.appendChild(dltbtn);
			return msgbox;
		}

        function readTable() {
            // 以前のテーブルから切り替える処理を入れようとしたけど、
            // ラジオボタンのクリック動作に割り込まないといけないみたいなので
            // やめる。
            var checkedTable = findCheckedRadio();
            if (! checkedTable) {
                console.log("can't find checked table");
                return;
            }
            // console.log(checkedTable.id + " -> " +  after);
            // if (checkedTable.id === after ){ console.log("same"); }

            var afterElem = document.getElementById(checkedTable.id);
            if ( typeof afterElem === "undefined") return ;
            afterElem.checked = true;

            cleanupMemoDisplay();

            // LocalStorageからメモを再読込
            // TODO Storageに保持数IDと、ラジオ切り替えのIDを同じにしないと
            revertMemoDisplay(checkedTable.id);
        }

        function cleanupMemoDisplay() {
            // 表示領域を初期化            
			var showDiv = document.getElementById("showbox");
            while (showDiv.firstChild)
                showDiv.removeChild(showDiv.firstChild);
        }

        function revertMemoDisplay( tableid ) {
            // console.log("revert to " + tableid );
            var memodataelem = localStorage.getItem( tableid )
            if ( ! memodataelem ) return;
            var memodata = memodataelem.split("") ;
			var showDiv = document.getElementById("showbox");
            for ( var idx in memodata ){
			    var child = createMsgBox(memodata[idx], 0);
			    showDiv.appendChild(child);
            }
                
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

        function createNewTable() {
            var tableNameElem = document.getElementById("new_table_name");
            if ( typeof tableNameElem === "undefined" ) return;
            var tableName = tableNameElem.value;
            console.log(tableName);

			var text = localStorage.getItem( mTableListKey );
            var keyStr;
            // null判定ってこれでいいの？
            if ( ! text ) {
                keyStr = tableName;
            } else {
                var keyList = text.split("");
                for ( var idx in keyList ){
                    if ( keyList[idx] === tableName ){
                        console.log(keyList[idx] + " but " +  tableName + " found in " + idx);
                        console.log("already exists : " + tableName);
                        return;
                    }
                }
                keyStr = text + "" + tableName;
            }
            localStorage.setItem( mTableListKey, keyStr );

            tableNameElem.value = "";

            addTableListDisplay(tableName, true);
            cleanupMemoDisplay();
            // revertMemoDisplay(mTablePrefix + tableName);
        }

        function addTableListDisplay(tableName, select) {
            var elem = document.getElementById("table_list_display");
            if (!elem) {
                console.log("table list display not found error");
                return;
            }

            var tableKey = mTablePrefix + tableName;
            var tableList = document.createElement("div");

            var tableListRadio = document.createElement("input");
            tableListRadio.setAttribute("type", "radio");
            tableListRadio.setAttribute("name", "memo_table");
            tableListRadio.setAttribute("id", tableKey);
            if (select) {
                tableListRadio.checked = true;
            }
            // tableListRadio.onclick = readTable;
            tableListRadio.addEventListener("click", readTable, false);
            tableList.appendChild(tableListRadio);

            var tableListLabel = document.createElement("label");
            tableListLabel.setAttribute("for", tableKey)
            tableListLabel.innerHTML=tableName;
            tableList.appendChild(tableListLabel);

            var tableListDelete = document.createElement("button");
            tableListDelete.setAttribute("type", "button");
            tableListDelete.setAttribute("id", "delete_" + tableName);
            tableListDelete.innerHTML="X"
            tableList.appendChild(tableListDelete);

            elem.insertBefore(tableList, elem.firstChild);
        }
