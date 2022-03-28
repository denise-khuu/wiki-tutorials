let onlineTutorials = []

function renderTutorial(tutorial){
	var tutorialCard = $('<div id="tutorial_' + tutorial['name'] + '" class="card col-12 col-md-5"></div>');
	var descDiv = $('<div class="card_desc"></div>')
	var title = $('<div class="title">' + tutorial['title'] + '</div>');
	var desc  = tutorial['description'].split('#')[0].split('For more information')[0].split('More information')[0]
	desc = desc.replace(/(\[|\])/g,'').replace(/\(.*?\)/, '');
	var description = $('<div class="card_description">' + desc + '</div>');
	var paths = $(
	`<div class = "card-paths">

		<a href="${tutorial['paths']['eclipse']}"><img src="./wiki-images/eclipse.png" class="card-img zoom"></img></a>
		<a href="${tutorial['paths']['vscode']}"><img src="./wiki-images/vscode.png" class="card-img zoom"></img></a>
		<a href="${tutorial['paths']['katacoda']}"><img src="./wiki-images/katacoda.png" class="card-img zoom"></img></a>
	</div>`
	)
	$("#tutorials").append(tutorialCard);
	descDiv.append(title, description)
	tutorialCard.append(descDiv,paths);
	
}

function getTutorials(){
	tutorials = []
	for(let tutorial of tutorialsJson){
		tutorials.push(tutorial['name']);
	}
	return tutorials;
}

function renderTutorials(tutorialsJson){
	for(let tutorial of tutorialsJson){
		renderTutorial(tutorial);
	}
}

function renderFilterItem(tagsJson, type, tutorials){
	for(const [key, value] of Object.entries(tagsJson[type])){
		filterItem = `
		<li>
			<div class="filter_item form-check filter-div">
				<input class="form-check-input" type="checkbox" onclick="filterOnClick()" name="filter-item" value="" id="${type}_${key}">
				<label class="form-check-label filter_item" for="${key}">
					${capitalizeFirstLetter(key)}
				</label>
			</div>
		</li>
		`
		$(`#filter_type_${type}`).append(filterItem);
	}
}

function renderFilter(tagsJson, tutorials){
	var tagTypes = ['difficulty', 'technology'];
	for(let type of tagTypes){
		var filterType = $('<div class="filterpanel"><div class="title filter_title">' + capitalizeFirstLetter(type) + '</div><ul id="filter_type_' + type + '" class="filter_type"></ul><div>');
		$("#filter").append(filterType);
		renderFilterItem(tagsJson, type, tutorials)
	}
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function filter(){
	var checkedBoxes = document.querySelectorAll('input[name=filter-item]:checked')
	var selectedTutorials = []
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const words = urlParams.get('search')
	if (checkedBoxes.length > 0) {
		for (let check of checkedBoxes){
			let type = check.id.split('_')[0];
			let tag = check.id.split('_')[1];
			selectedTutorials = [...new Set([...selectedTutorials,...tagsJson[type][tag]])];
		}
		filterTutorials(selectedTutorials);
		onlineTutorials = selectedTutorials;
	}
	else {
		onlineTutorials = getTutorials()
		for (let tutorial of onlineTutorials){
			document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
		}
	}
}

function filterTutorials(selectedTutorials){
	for (let tutorial of onlineTutorials){
			if(selectedTutorials.includes(tutorial)){
				document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
			}
			else{
				document.getElementById(`tutorial_${tutorial}`).style["display"] = "None";
			}
		}
}

function filterOnClick(){
	search()
	filter()
}

function searchOnPress(){
	const searchParams = new URLSearchParams(document.location.hash.length > 0 ? document.location.hash.substring(1) : "");
	let words = document.getElementById("search-field-tutorial").value
	searchParams.append("search",words)
	window.history.replaceState({}, "", decodeURIComponent(`${window.location.pathname}?${searchParams}`));
	filter()
	search()
}

function search(){
	const queryString = window.location.search
	const urlParams = new URLSearchParams(queryString)
	const words = urlParams.get('search')
	const checkedBoxes = document.querySelectorAll('input[name=filter-item]:checked')
	let queryRes = words ? searchData.index.search(words) : [];
	let selectedTutorials = []
	const findById = (id, objects) => {
		const obj = objects.find((obj) => '' + obj.id == '' + id);
		return obj;
    };
	for (let i = 0; i < queryRes.length; i++) {
		let res = queryRes[i];
		let obj = findById(res.ref, searchData.documents);
		selectedTutorials.push(obj.dirname);
	}
	if( words.length > 0) {
		filterTutorials(selectedTutorials);
		onlineTutorials = selectedTutorials;
	}else{
		onlineTutorials = getTutorials();
		for (let tutorial of onlineTutorials){
			document.getElementById(`tutorial_${tutorial}`).style["display"] = "flex";
		}
	}
}

async function main() {
	
	indexJson = await $.ajax({
        url: "index.json?r=" + Math.random() * 10000
    });

    docsJson = await $.ajax({
        url: "docs.json?r=" + Math.random() * 10000
    });

    tutorialsJson = await $.ajax({
        url: "tutorials.json?r=" + Math.random() * 10000
    });

    tagsJson = await $.ajax({
        url: "tags.json?r=" + Math.random() * 10000
    });
	
	searchData = { index: lunr.Index.load(indexJson), documents: docsJson };
	
	onlineTutorials = getTutorials(tutorialsJson)	
	var container = $('<div id="tutorial_container" class="tutorial_container col-12 row"></div>');
    var tutorialsDiv = $('<div id="tutorials" class="tutorials col-12 col-md-9 row"></div>');
	var filterPanelDiv = $('<div id="filter" class="filter col-12 col-md-3 "></div>');
	var seachFieldDiv = '<div class="search-bar col-12"><input onkeyup="searchOnPress()" id="search-field-tutorial" type="search" class="form-control mr-sm-2" placeholder="Search by keyword(s)..." aria-label="Search" style="height: auto;"/>';
	$("head").append('<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">');
	$("#content").append(seachFieldDiv, container)
	container.append(filterPanelDiv, tutorialsDiv);
	renderTutorials(tutorialsJson);
	renderFilter(tagsJson, onlineTutorials);

	
}

main();