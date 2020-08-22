/*
Program       esci-see-r.js
Author        Gordon Moore
Date          20 August 2020
Description   The JavaScript code for esci-see-r
Licence       GNU General Public Licence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version

*/
//#endregion 

let version = '0.0.1';

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure everything is working

  //#region for variable definitions (just allows code folding)
  let tooltipson              = false;                                        //toggle the tooltips on or off

  const display               = document.querySelector('#display');        //display of pdf area

  let realHeight              = 100;                                          //the real world height for the pdf display area
  let margin                  = {top: 0, right: 10, bottom: 0, left: 70};     //margins for pdf display area
  let width;                                                                  //the true width of the pdf display area in pixels
  let heightP;   
  let rwidth;                                                                 //the width returned by resize
  let rheight;                                                                //the height returned by resize
  
  let left;
  let right;

  let pauseId;
  let repeatId;
  let delay = 50;
  let pause = 500;

  let sliderinuse = false;

  //panel 1 N
  let $Nslider;
  let N = 10;
  $Nval = $('#Nval');
  $Nval.val(N.toFixed(0));
  $Nnudgebackward = $('#Nnudgebackward');
  $Nnudgeforward = $('#Nnudgeforward');

  //panel 2 r
  let $rslider;
  let r = 0.5;
  $rval = $('#rval');
  $rval.val(r.toFixed(1));
  $rnudgebackward = $('#rnudgebackward');
  $rnudgeforward = $('#rnudgeforward');

  //panel 3 rho
  let $rhoslider;
  let rho = 0.5;
  $rhoval = $('#rhoval');
  $rhoval.val(rho.toFixed(1));
  $rhonudgebackward = $('#rhonudgebackward');
  $rhonudgeforward = $('#rhonudgeforward');

  //panel 4 New data set
  $newdataset = $('#newdataset');
  
  let svgD;   
                                                                              //the svg reference to pdfdisplay
  const $display            = $('#display');

  //api for getting width, height of element - only gets element, not entire DOM
  // https://www.digitalocean.com/comxbarcontrolnity/tutorials/js-resize-observer
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      rwidth = entry.contentRect.width;
      //rHeight = entry.contentRect.height;  //doesn't work
      rheight = $('#display').outerHeight(true);
    });
  });

  //#endregion

  //breadcrumbs
  $('#homecrumb').on('click', function() {
    window.location.href = "https://www.esci.thenewstatistics.com/";
  })

  initialise();

  function initialise() {

    setTooltips();

    //get initial values for height/width
    rwidth  = $('#display').outerWidth(true);
    rheight = $('#display').outerHeight(true);

    d3.selectAll('svg > *').remove();  //remove all elements under svgP
    $('svg').remove();                 //remove the all svg elements from the DOM

    //pdf display
    svgD = d3.select('#display').append('svg').attr('width', '100%').attr('height', '100%');

    setupSliders(); 

    resize();



    clear();

  }

  function resize() {
    //have to watch out as the width and height do not always seem precise to pixels
    //browsers apparently do not expose true element width, height.
    //also have to think about box model. outerwidth(true) gets full width, not sure resizeObserver does.

    resizeObserver.observe(display);  //note doesn't get true outer width, height

    width   = rwidth - margin.left - margin.right;  
    heightP = rheight - margin.top - margin.bottom;

    clear();
  }

  function setupSliders() {

    $('#Nslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 5,
      type: 'single',
      min: 0,
      max: 100,
      from: 10,
      step: 10,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        N = data.from;
        sliderinuse = true;  //don't update dslider in updateN()
        updateN();
        $('#Nval').val(N.toFixed(0));
        redrawDisplay();
      }
    })
    $Nslider = $('#Nslider').data("ionRangeSlider");

    $('#rslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1,
      max: 1,
      from: 0.5,
      step: 0.1,
      prettify: prettify1,
      //on slider handles change
      onChange: function (data) {
        r = data.from;
        sliderinuse = true;  //don't update dslider in updateN()
        updater();
        $('#rval').val(r.toFixed(1));
        redrawDisplay();
      }
    })
    $rslider = $('#rslider').data("ionRangeSlider");

    $('#rhoslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1,
      max: 1,
      from: 0.5,
      step: 0.1,
      prettify: prettify1,
      //on slider handles change
      onChange: function (data) {
        rho = data.from;
        sliderinuse = true;  //don't update dslider in updateN()
        updater();
        $('#rhoval').val(rho.toFixed(1));
        redrawDisplay();
      }
    })
    $rhoslider = $('#rhoslider').data("ionRangeSlider");

  }


  function updateN() {
    if (!sliderinuse) $Nslider.update({ from: N })
    sliderinuse = false;
    redrawDisplay();
  }

  function updater() {
    if (!sliderinuse) $rslider.update({ from: r })
    sliderinuse = false;
    redrawDisplay();
  }

  function updaterho() {
    if (!sliderinuse) $rhoslider.update({ from: rho })
    sliderinuse = false;
    redrawDisplay();
  }


  function prettify0(n) {
    return n.toFixed(0);
  }

  function prettify1(n) {
    return n.toFixed(1);
  }

  function prettify2(n) {
    return n.toFixed(2);
  }


  //set everything to a default state.
  function clear() {
    //set sliders to initial
    N = 10;
    updateN();
    $Nval.text(N.toFixed(0));

    r = 0.5;
    updater();
    $rval.text(r.toFixed(1));    

    rho = 0.5;
    updater();
    $rhoval.text(rho.toFixed(1));  
  }

  function redrawDisplay() {

  }

  /*--------------------------------------New Data Set----------*/

  $newdataset.on('change', function() {
    
  })


/*----------------------------------------N nudge bars-----------*/
  //changes to N
  $Nval.on('change', function() {
    if ( isNaN($Nval.val()) ) {
      $Nval.val(N.toFixed(0));
      return;
    };
    N = parseFloat($Nval.val()).toFixed(0);
    if (N < 1) {
      N = 1;
    }
    if (N > 100) {
      N = 100;
    }
    $Nval.val(N.toFixed(0));
    updateN();
  })

  $Nnudgebackward.on('mousedown', function() {
    Nnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        Nnudgebackward();
      }, delay );
    }, pause)
  })

  $Nnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function Nnudgebackward() {
    N -= 1;
    if (N < 1) N = 1;
    $Nval.val(N.toFixed(0));
    updateN();
  }

  $Nnudgeforward.on('mousedown', function() {
    Nnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        Nnudgeforward();
      }, delay );
    }, pause)
  })

  $Nnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function Nnudgeforward() {
    N += 1;
    if (N > 100) N = 100;
    $Nval.val(N.toFixed(0));
    updateN();
  }

/*----------------------------------------r nudge bars-----------*/
  //changes to r
  $rval.on('change', function() {
    if ( isNaN($rval.val()) ) {
      $rval.val(r.toFixed(1));
      return;
    };
    r = parseFloat($rval.val()).toFixed(1);
    if (r < -1) {
      r = -1;
    }
    if (r > 1) {
      r = 1;
    }
    $rval.val(r.toFixed(1));
    updater();
  })

  $rnudgebackward.on('mousedown', function() {
    rnudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rnudgebackward();
      }, delay );
    }, pause)
  })

  $rnudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rnudgebackward() {
    r -= 0.1;
    if (r < -1) r = -1;
    $rval.val(r.toFixed(1));
    updater();
  }

  $rnudgeforward.on('mousedown', function() {
    rnudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rnudgeforward();
      }, delay );
    }, pause)
  })

  $rnudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rnudgeforward() {
    r += 0.1;
    if (r > 1) r = 1;
    $rval.val(r.toFixed(1));
    updater();
  }

/*----------------------------------------rho nudge bars-----------*/
  //changes to rho
  $rhoval.on('change', function() {
    if ( isNaN($rhoval.val()) ) {
      $rhoval.val(rho.toFixed(1));
      return;
    };
    rho = parseFloat($rval.val()).toFixed(1);
    if (rho < -1) {
      rho = -1;
    }
    if (rho > 1) {
      rho = 1;
    }
    $rhoval.val(rho.toFixed(1));
    updaterho();
  })

  $rhonudgebackward.on('mousedown', function() {
    rhonudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rhonudgebackward();
      }, delay );
    }, pause)
  })

  $rhonudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rhonudgebackward() {
    rho -= 0.1;
    if (rho < -1) rho = -1;
    $rhoval.val(rho.toFixed(1));
    updaterho();
  }

  $rhonudgeforward.on('mousedown', function() {
    rhonudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        rhonudgeforward();
      }, delay );
    }, pause)
  })

  $rhonudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function rhonudgeforward() {
    rho += 0.1;
    if (rho > 1) rho = 1;
    $rhoval.val(rho.toFixed(1));
    updaterho();
  }





  /*---------------------------------------------Tooltips on or off-------------------------------------- */

  function setTooltips() {
    Tipped.setDefaultSkin('esci');

    //heading section
    Tipped.create('#logo',          'Version: '+version,                              { skin: 'red', size: 'versionsize', behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });
  
    Tipped.create('#tooltipsonoff', 'Tips on/off, default is off!',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.headingtip',    'https://thenewstatistics.com',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.create('.hometip',       'Click to return to esci Home',                   { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    

    //spare
    // Tipped.create('. tip', '', { skin: 'esci', size: 'xlarge', showDelay: 750, behavior: 'mouse', target: 'mouse', maxWidth: 250, hideOthers: true, hideOnClickOutside: true, hideAfter: 0 });

    Tipped.disable('[data-tooltip]');
  }

  $('#tooltipsonoff').on('click', function() {
    if (tooltipson) {
      tooltipson = false;
      $('#tooltipsonoff').css('background-color', 'lightgrey');
    }
    else {
      tooltipson = true;
      $('#tooltipsonoff').css('background-color', 'lightgreen');
      Tipped.enable('[data-tooltip]');
    }
  })


  /*----------------------------------------------------------footer----------------------------------------*/
 
  $('#footer').on('click', function() {
    window.location.href = "https://thenewstatistics.com/";
  })

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function(){
          resize();
        }, 500);
    });
  });

  //helper function for testing
  function lg(s) {
    console.log(s);
  }  

})

