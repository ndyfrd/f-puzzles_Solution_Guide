// ==UserScript==
// @name         Fpuzzles-Solution_Guide
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds the ability to create an html document containing a solve guide 
// @author       Ennead
// @match        https://*.f-puzzles.com/*
// @match        https://f-puzzles.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
	'use strict';

	const doShim = function() {

	    let htmlObj = {};
	    let steps = 0;
	    let editing = false;
	    let confirmDelete = false;
	    let feedback = '';

	    const btnLX = sidebarGap + buttonGap + buttonW/4.5;
	    const btnRX = sidebarGap + 2*buttonGap + buttonW/4.5 + buttonW/2.1;
	    const btnsT = 500;
	    const btnsB = btnsT + buttonSH + buttonGap; 
	    const stepBtnW = buttonW/2.1; 

	    let btns = { 'Add+Confirm':     { x: btnLX, 
	                                  y: btnsT, 
	                                  title: 'Add Step' },
                    'EditStep':     { x: btnRX, 
	                                  y: btnsT, 
	                                  title: 'Edit Step' },
	                'Export+Delete':  { x: btnRX, 
	                                  y: btnsB, 
	                                  title: 'Export' },
                    'Preview+Cancel': { x: btnLX, 
	                                  y: btnsB, 
	                                  title: 'Preview' }
	    }


		for (let btn in btns) {
			buttons.push(new button(btns[btn].x, btns[btn].y, 
			                 buttonW/2.1, buttonSH, 
			                 ['Solving'], btn, btns[btn].title));
		}

		let showButtons = function(show) {
		    for (let btn in btns) {
	            buttons.filter(b => b.id === btn)[0].y = (show) ? btns[btn].y : -1000;
		    }
		}

        let base64Image = function() {
	        ctx = canvas2.getContext('2d');
	        canvas2.width = canvas.width;
	        canvas2.height = canvas.height;
	        ctx.textAlign = 'center';
	        
	        ctx.fillStyle = '#FFFFFF';
	        ctx.fillRect(0, 0, canvas.width, canvas.height);
	        drawGrid();
	        
	        ctx = canvas3.getContext('2d');
	        canvas3.width = (gridSL + lineWW) * downloadResolution;
	        canvas3.height = (gridSL + lineWW) * downloadResolution;
	        ctx.save();
	        ctx.scale(downloadResolution, downloadResolution);
	        ctx.drawImage(canvas2, gridX - lineWW/2, gridY - lineWW/2, gridSL + lineWW, gridSL + lineWW, 0, 0, canvas3.width / downloadResolution, canvas3.height / downloadResolution);
	        ctx.restore();
	        
	        ctx = canvas.getContext('2d');
	        
	        return canvas3.toDataURL();
        }

        let newSection = function(stepName) {
	        htmlObj[stepName] = { desc: document.getElementById('noteInput').value,
	                              img: base64Image(),
	                              puzzle: exportPuzzle(true) };
        }

		let createHTML = function() {
		    let html = 
	            `<!DOCTYPE html><html lang="en">
	            <head>
	              <meta charset="UTF-8">
	              <meta name="viewport" content="width=device-width, initial-scale=1.0">
	            </head>
	            <title>` + customTitle + ` by ` + author + `</title>
	            <body style="background-color: #bcd; color: #034;">
	              <h1 style="text-align: center; 
	                         width: 100%; 
	                         font-weight: normal; 
	                         font-size: 36px; 
	                         margin: 50px 0;">` + customTitle +  `<span style="font-size:24px"> by </span>` + author + 
	             `</h1>`;

		    for (let key in htmlObj) { 
		        html += 
	            `<section style="display: flex; 
	                             justify-content: space-around; 
	                             align-items: center; 
	                             margin: 50px 0;">
	              <div style="display: inherit; width: 50%; justify-content: space-around;">
	                <img style="width: 75%;" src="` + htmlObj[key].img + `"/>
	              </div>
	              <div style="display: inherit; justify-content: space-around; width: 50%;">
	                <pre style="width: 90%; font-size: 22px;">` + htmlObj[key].desc + `</pre>
	              </div>
	            </section>`;
	        }

	        html += `</body></html>`;
		    console.log(html);
		    return html;
		}

	    let moveBtns = function(moveTo) {
		    if (moveTo === 'out') {
				buttons[buttons.findIndex(b => b.id === 'EditStep')].y = -1000;
				buttons[buttons.findIndex(b => b.id === 'Add+Confirm')].title = 'Confirm';
				buttons[buttons.findIndex(b => b.id === 'Preview+Cancel')].title = 'Cancel';
				buttons[buttons.findIndex(b => b.id === 'Export+Delete')].title = 'Delete';
			}
		    if (moveTo === 'in') {
				buttons[buttons.findIndex(b => b.id === 'EditStep')].y = btns['EditStep'].y;
				buttons[buttons.findIndex(b => b.id === 'Add+Confirm')].title = 'Add Step';
				buttons[buttons.findIndex(b => b.id === 'Preview+Cancel')].title = 'Preview';
				buttons[buttons.findIndex(b => b.id === 'Export+Delete')].title = 'Export';
			}
	    }

	    let getStep = function(step) {
	        noteInput.value = htmlObj[step].desc;
            importPuzzle(htmlObj[step].puzzle, false);
	    }

	    let deleteStep = function(step) {
	        for (step; step < Object.keys(htmlObj).length; step++) {
	            htmlObj[step] = htmlObj[parseInt(step) + 1];
	        }

	        delete htmlObj[Object.keys(htmlObj).length]
	        console.log(htmlObj);
	        feedback = sel.value + ' Deleted.';
	        steps--;
	    }

        //Buttons
	    buttons.filter(b => b.id === 'Add+Confirm')[0].click = function() {
			if (!this.hovering()) return;

	        if (editing) {
	            newSection(sel.value[sel.value.length - 1]);
			    sel.style.display = 'none';
			    getStep(steps);
	            feedback = sel.value + ' Changed.';
	            moveBtns('in');
	            editing = false;
	            return;
	        }

			steps++;
	        newSection(steps);
	        noteInput.value = '';
	        feedback = 'Step ' + steps + ' Added.'
	        console.log(htmlObj)
		}

	    buttons.filter(b => b.id === 'EditStep')[0].click = function() {
			if (!this.hovering()) return;

			if (steps > 0) {
			    editing = true;
			    const sel = document.getElementById('stepSelect')
			    sel.style.display = 'block';
			    sel.innerHTML = '';

                for (let a = 0; a <= steps; a++) {
			        let opt = document.createElement('option');
			        if (a == 0) {
			            opt.selected = true;
			            opt.disabled = true;
			            opt.hidden = true;
			            opt.value = '';
			            opt.innerHTML = 'Step #';
			            sel.append(opt);
			        } else {
			            opt.value = 'Step ' + a;
			            opt.innerHTML ='Step ' +  a;
			            sel.append(opt);
			        }
                }

            moveBtns('out');
        }
	}

	    buttons.filter(b => b.id === 'Preview+Cancel')[0].click = function() {
			if (!this.hovering()) return;
			if (editing) {
			    sel.style.display = 'none';
	            moveBtns('in');
			    getStep(steps);
	            editing = false;
	            confirmDelete = false;
	            return;
			}

			const link = document.createElement('a');
			const file = new Blob([createHTML()], { type: 'text/html' });
			window.open(URL.createObjectURL(file), '_blank');
			URL.revokeObjectURL(link.href);
		}

	    buttons.filter(b => b.id === 'Export+Delete')[0].click = function() {
			if (!this.hovering()) return;

            if (editing) {
			    if (confirmDelete) {
			        sel.style.display = 'none';
			        deleteStep(sel.value[sel.value.length - 1]);
	                moveBtns('in');
			        if (steps > 0) getStep(steps);
	                editing = false;
	                confirmDelete = false;
	                return;
	            }

			    if (this.title = 'Delete') {
			        this.title = 'Sure?';
			        confirmDelete = true;
			        return;
			    }
	        }

			const link = document.createElement('a');
			const file = new Blob([createHTML()], { type: 'text/plain' });
			link.download = 'solveguide.html';
			link.href = URL.createObjectURL(file);
			link.click();
			URL.revokeObjectURL(link.href);
		}

		let stepSelectAttr = {
							 'id': 'stepSelect', 
							 'name': 'stepSelect', 
							 'size': '1', 
							 'style': 'border: min(0.35vh * 16 / 9, 0.35vw) solid #000000;' +
							          'overflow-x: hidden;' +
									  'overflow-y: auto;' +
									  'border-radius: 0px;' +
                                      'outline: none;' +
						 	 		  'position: fixed;' +
			                          'display: none;'
							}
		const sel = document.createElement('select');
		for (let key in stepSelectAttr) { sel.setAttribute(key, stepSelectAttr[key]); }
		document.body.appendChild(sel);
		sel.onchange = () => getStep(sel.value[sel.value.length - 1]);


        let noteInputAttr = {
                              'id': 'noteInput', 
                              'placeholder': 'Solve step description',
                              'wrap': 'soft',
                              'white-space': 'pre',
                              'style': 'border: 4px solid black;' +
                                       'font-size: 16px;' +
                                       'outline: none;' +
                                       'position: fixed;' +
                                       'display: none;'
                             }
        const noteInput = document.createElement('textarea');
        for (let key in noteInputAttr) { noteInput.setAttribute(key, noteInputAttr[key]); }
        document.body.appendChild(noteInput);

		let positionInputs = function() {
            noteInput.style.left = window.innerWidth/2 - canvas.clientWidth/2.11;
            noteInput.style.top = canvas.clientHeight - canvas.clientHeight/2.85;
            noteInput.style.width = canvas.clientWidth/5.8;
            noteInput.style.height = canvas.clientHeight/3.85;
            sel.style.left = window.innerWidth/2 - canvas.clientWidth/2.59;
            sel.style.top =  canvas.clientHeight - canvas.clientHeight/2.235;
		    sel.style.width = canvas.clientWidth/11.8;
		    sel.style.height = canvas.clientHeight/24;
		}

		let doFeedback = function(text) {
		    ctx.save();
		    ctx.font = '24px Arial';
		    ctx.fillStyle = boolSettings['Dark Mode'] ? '#F0F0F0' : '#e35';
		    ctx.textAlign = 'left';
		    ctx.fillText(text, 45, 845);
		    ctx.fillStyle = boolSettings['Dark Mode'] ? '#F0F0F0' : '#e35';
		    ctx.textAlign = 'right';
		    ctx.fillText(steps, sidebarW + 15, 845);
		    ctx.restore();
		}

        positionInputs();
        window.onresize = () => positionInputs();
	    boolSettings.splice(7, 0, 'Solve Path Tool');
	    defaultSettings.splice(7, 0, true);

        let prevCreateOtherButtons = createOtherButtons;
        createOtherButtons = function() {

            prevCreateOtherButtons();

	        for(var a = 0; a < 9; a++) {
	            buttons.filter(b => b.id === boolSettings[a])[0].y -= 10;
	        }
	    }

        let prevDrawScreen = drawScreen;
        drawScreen = function(step, forced) {
            prevDrawScreen(step, forced);

            if (boolSettings['Solve Path Tool'] && mode === 'Solving') {
                if (!editing) showButtons(true);
                noteInput.style.display = 'block';
                doFeedback(feedback);
            }else{
                showButtons(false);
                sel.style.display = 'none';
                noteInput.style.display = 'none';
            }
        }

		const prevOnKeyDown = document.onkeydown;
		document.onkeydown = function(event) {
			if (mode === 'Solving' && document.activeElement.id === '') {
				prevOnKeyDown(event);
				return;
			}
		}
	}

    if (window.grid) {
        doShim();
    } else {
        document.addEventListener('DOMContentLoaded', (event) => {
            doShim();
        });
    }
})();

