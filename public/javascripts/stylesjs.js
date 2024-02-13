$( '#single-select-field' ).select2( {
    theme: "bootstrap-5",
    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
    placeholder: $( this ).data( 'placeholder' ),
} );

$('#basic').multiselect({
    templates: {
        li: '<li><a href="javascript:void(0);"><label class="pl-2"></label></a></li>'
    }
});

$(document).ready(function() {
    $('#multiple-checkboxes').multiselect({
      includeSelectAllOption: true,
    });
});