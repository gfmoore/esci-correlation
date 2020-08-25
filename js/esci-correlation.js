/*
Program       esci-correlation.js
Author        Gordon Moore
Date          20 August 2020
Description   The JavaScript code for esci-correlation
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

  //tab 1 panel 1 N1
  let $N1slider;
  let N1 = 4;
  const $N1val = $('#N1val');
  $N1val.val(N1.toFixed(0));
  const $N1nudgebackward = $('#N1nudgebackward');
  const $N1nudgeforward = $('#N1nudgeforward');

  //tab 1 panel 2 r
  let $rslider;
  let r = 0.5;
  const $rval = $('#rval');
  $rval.val(r.toFixed(2).toString().replace('0.', '.'));
  const $calculatedr = $('#calculatedr');
  const $rnudgebackward = $('#rnudgebackward');
  const $rnudgeforward = $('#rnudgeforward');

  //tab 1 panel 3 New data set
  const $newdataset = $('#newdataset');
  
  //tab 1 panel 4 Display features
  const $displayr = $('#displayr');
  let displayr;

  const $displayctm = $('#displayctm');
  let displayctm;

  const $displaymd = $('#displaymd');
  let displaymd;

  //tab 1 panel 5 Descriptive statstics
  const $statistics1 = $('#statistics1');
  const $statistics1show = $('#statistics1show');
  let statistics1show = false;

  
  //tab 1 panel 6 Display lines
  const $displaylines1 = $('#displaylines1');
  const $displaylines1show = $('#displaylines1show');
  let displaylines1show = false;

  const $corryx = $('#corryx');
  let corryx;
  
  const $corrxy = $('#corrxy');
  let corrxy;

  const $corrlineslope = $('#corrlineslope');
  let corrlineslope;


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

    $('#N1slider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 6,
      type: 'single',
      min: 0,
      max: 300,
      from: 4,
      step: 1,
      prettify: prettify0,
      //on slider handles change
      onChange: function (data) {
        N1 = data.from;
        if (N1 < 4) N1 = 4;
        sliderinuse = true;  //don't update dslider in updateN1()
        updateN1();
        $N1val.val(N1.toFixed(0));
        redrawDisplay();
      },
      onFinish: function(data) {
        updateN1();
      }
    })
    $N1slider = $('#N1slider').data("ionRangeSlider");

    $('#rslider').ionRangeSlider({
      skin: 'big',
      grid: true,
      grid_num: 4,
      type: 'single',
      min: -1,
      max: 1,
      from: 0.5,
      step: 0.01,
      prettify: prettify2,
      //on slider handles change
      onChange: function (data) {
        r = data.from;
        sliderinuse = true;  //don't update dslider in updater()
        updater();
        $rval.val(r.toFixed(2).toString().replace('0.', '.'));
        $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'))
        redrawDisplay();
      }
    })
    $rslider = $('#rslider').data("ionRangeSlider");

  }


  function updateN1() {
    if (!sliderinuse) $N1slider.update({ from: N1 })
    sliderinuse = false;
    redrawDisplay();
  }

  function updater() {
    if (!sliderinuse) $rslider.update({ from: r })
    sliderinuse = false;
    redrawDisplay();
  }

  function prettify0(n) {
    return n.toFixed(0);
  }

  function prettify1(n) {
    return n.toFixed(1).toString().replace('0.', '.');
  }

  function prettify2(n) {
    return n.toFixed(2).toString().replace('0.', '.');
  }


  //set everything to a default state.
  function clear() {
    //set sliders to initial


    N1 = 4;
    updateN1();
    $N1val.text(N1.toFixed(0));

    r = 0.5;
    updater();
    $rval.text(r.toFixed(2).toString().replace('0.', '.'));    
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.')); 

    $statistics1.hide();
    $displaylines1.hide();
  }

  function redrawDisplay() {

  }

  /*--------------------------------------New Data Set----------------*/ 

  $newdataset.on('change', function() {  //button

  })

  /*--------------------------------------Display Features-------------*/

  $displayr.on('change', function() {
    displayr = $displayr.is(':checked');

  })

  $displayctm.on('change', function() {
    displayctm = $displayctm.is(':checked');

  })

  $displaymd.on('change', function() {
    displaymd = $displaymd.is(':checked');

  })


//show statistics
$statistics1show.on('change', function() {
  statistics1show = $statistics1show.prop('checked');
  if (statistics1show) {
    $statistics1.show();
  }
  else {
    $statistics1.hide();
  }

})

//show display lines
$displaylines1show.on('change', function() {
  displaylines1show = $displaylines1show.prop('checked');
  if (displaylines1show) {
    $displaylines1.show();
  }
  else {
    $displaylines1.hide();
  }
})

$corryx.on('change', function() {
  corryx = $corryx.is(':checked');

})

$corrxy.on('change', function() {
  corrxy = $xorrxy.is(':checked');

})

$corrlineslope.on('change', function() {
  corrlineslope = $corrlineslope.is(':checked');

})

/*----------------------------------------N1 nudge bars-----------*/
  //changes to N1
  $N1val.on('change', function() {
    if ( isNaN($N1val.val()) ) {
      $N1val.val(N1.toFixed(0));
      return;
    };
    N1 = parseFloat($N1val.val()).toFixed(0);
    if (N1 < 4) {
      N1 = 4;
    }
    if (N1 > 300) {
      N1 = 300;
    }
    $N1val.val(N1.toFixed(0));
    updateN1();
  })

  $N1nudgebackward.on('mousedown', function() {
    N1nudgebackward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N1nudgebackward();
      }, delay );
    }, pause)
  })

  $N1nudgebackward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N1nudgebackward() {
    N1 -= 1;
    if (N1 < 4) N1 = 4;
    $N1val.val(N1.toFixed(0));
    updateN1();
  }

  $N1nudgeforward.on('mousedown', function() {
    N1nudgeforward();
    pauseId = setTimeout(function() {
      repeatId = setInterval ( function() {
        N1nudgeforward();
      }, delay );
    }, pause)
  })

  $N1nudgeforward.on('mouseup', function() {
    clearInterval(repeatId);
    clearTimeout(pauseId);
  })

  function N1nudgeforward() {
    N1 += 1;
    if (N1 > 300) N1 = 300;
    $N1val.val(N1.toFixed(0));
    updateN1();
  }

/*----------------------------------------r nudge bars-----------*/
  //changes to r
  $rval.on('change', function() {
    if ( isNaN($rval.val()) ) {
      $rval.val(r.toFixed(2).toString().replace('0.', '.'));
      $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
      return;
    };
    r = parseFloat($rval.val());
    if (r < -1) {
      r = -1;
    }
    if (r > 1) {
      r = 1;
    }
    $rval.val(r.toFixed(2).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
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
    r -= 0.01;
    if (r < -1) r = -1;
    $rval.val(r.toFixed(2).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
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
    r += 0.01;
    if (r > 1) r = 1;
    $rval.val(r.toFixed(1).toString().replace('0.', '.'));
    $calculatedr.text(r.toFixed(2).toString().replace('0.', '.'));
    updater();
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

