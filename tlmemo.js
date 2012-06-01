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
                var tableList = JSON.parse( existsTables );
                for ( var idx in tableList ) {
                    addTableListDisplay(tableList[idx]["t"], (idx === 0) ? true : false);
                }
            }
		}
 
        function saveMemo() {
            var memo = document.getElementById( "savearea" ).value;

            if ( ! memo ) return;
            var tableid = findCheckedRadio().id;
            var memoobj = createMemoObj( memo );
            var memoid = addLocalStorage( tableid, memoobj );

			var showDiv = document.getElementById("showbox");
            var msg = createMemoBox(memoobj, memoid);
			showDiv.insertBefore(msg, showDiv.firstChild);

            document.getElementById( "savearea" ).value = "";
        }

        function addLocalStorage( tableid, memoobj ) {
            var original = localStorage.getItem( tableid );
            var saveData;
            if ( ! original ) {
                saveData = {};
            } else {
                saveData = JSON.parse(original);
            }
            var memoid = createLatestMemoId();
            saveData[memoid] = memoobj;
            localStorage.setItem( tableid, JSON.stringify(saveData) );

            return memoid;
        }

        function createMemoObj( memo ) {
            return {"m":memo,
                "t":new Date().getTime()};
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

		function createMemoBox(msg_obj, msg_id) {
			var msgbox = document.createElement("div");
            msgbox.setAttribute("class", "msgbox");

			var dltbtn = document.createElement("button");
            dltbtn.setAttribute("class", "dltbtn");
			dltbtn.setAttribute("id", msg_id);
			dltbtn.innerHTML = "x";

			var msgdatebox = document.createElement("div");
            msgdatebox.setAttribute("class", "datebox");
            var msg_date = new Date();
            msg_date.setTime(msg_obj.t);
			msgdatebox.innerHTML = msg_date.getFullYear()  + "/" + (msg_date.getMonth() + 1) + "/" + msg_date.getDate() + " " + 
                msg_date.getHours() + ":" + msg_date.getMinutes() + ":" + msg_date.getSeconds();

			var msg = document.createElement("div");
            msg.setAttribute("class", "sentence");
			msg.innerHTML = msg_obj.m;

			msgbox.appendChild(msgdatebox);
			msgbox.appendChild(dltbtn);
			msgbox.appendChild(msg);
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
            var memodata = JSON.parse( memodataelem );
			var showDiv = document.getElementById("showbox");
            for ( var idx in memodata ){
			    var child = createMemoBox(memodata[idx], idx);
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
                var keyList = [];
                keyList[0] = {"t":tableName};
                keyStr = JSON.stringify( keyList );
            } else {
                var keyList = JSON.parse(text);
                for ( var idx in keyList ){
                    if ( keyList[idx]["t"] === tableName ){
                        console.log(keyList[idx]["t"] + " but " +  tableName + " found in " + idx);
                        console.log("already exists : " + tableName);
                        return;
                    }
                }
                keyList[keyList.length] = {"t":tableName};
                keyStr = JSON.stringify( keyList );
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
