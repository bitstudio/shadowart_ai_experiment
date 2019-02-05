// author: Ikhwan Hafidhi
// website : www.pekancoding.tech
function PCAutoCompletion(config, func) {
    //say hello
    console.log('pekancoding.tech');


    //parameter must be not undefine
    (func == undefined)?func = function(){}:func=func;
    let itemList = config.itemList;
    let minWord = (config.minWord == undefined || config.minWord < 0)?config.minWord=1:config.minWord;

    let el = document.getElementById(config.id);

    //index start at 0, it is not select anything
    let index = -1;
    let suggestedArray = new Array();
    let selectedObject = new Object();

    let cleanAll = function() {
        suggestedArray.length = 0;
        index = -1;
        if (document.getElementById('pc-autocompletion') != null) {
            document.getElementById('pc-autocompletion').remove();
        }
    }
    let clickIndex = function(index) {
        selectedObject=suggestedArray[index];
        el.value = selectedObject[config.showElement];
        document.getElementById('pc-autocompletion').remove();

        func();
    }
    let select = function(ev) {
        let list = document.getElementsByClassName('pc-li');
        let active = config.view.active;
        //up
        if (ev.keyCode == 38) {
            moveUp();
        } 
        //down
        else if (ev.keyCode == 40) {
            moveDown();
        }
        //enter
        else if (ev.keyCode == 13) {
            clickIndex(index);
        }
        //tab
        else if (ev.keyCode == 9) {
            clickIndex(index);
        }

        function moveUp() {
            if (index > 0) {
                deSelect();
                index--;
                list[index].classList.add(active);
            }
        }
        function moveDown() {
            if (index < list.length-1) {
                deSelect();
                index++;
                list[index].classList.add(active);
            }
        }
        function deSelect() {
            for(let i=0;i<list.length;i++) {
                list[i].classList.remove(active);
            }
        }
    }
    let getSuggested = function () {
        cleanAll();
        if (el.value.length >= minWord) {
            itemList.forEach(element => {
                for (prop in element) {
                    //here it is
                    if (element[prop].toString().toLowerCase().includes(el.value.toLowerCase())) {
                        add(element);
                    }
                }
            });

            let ul = document.createElement('ul');
            ul.style.position="absolute";
            ul.style.width="100%";
            ul.style.background="white";
            
            ul.setAttribute('class', config.view.ul);
            ul.id = 'pc-autocompletion';
            suggestedArray.forEach(function(element, index) {
                let li = document.createElement('li');
                li.style.cursor="pointer";
                
                li.setAttribute('class', 'pc-li '+config.view.li);
                li.innerHTML = element[config.showElement];

                //add event listener
                li.addEventListener('click', function(){clickIndex(index)});

                ul.appendChild(li);
            });
            show(ul);

        }

        function add(obj) {
            suggestedArray.push(obj);
        }

        function show(element) {
            el.parentElement.appendChild(element);
        }
    }

    el.addEventListener('keydown', function (ev) {
        select(ev);
    });
    el.addEventListener('input', getSuggested);

    //class property
    this.getSelectedObject = function() {
        return selectedObject;
    }
}
