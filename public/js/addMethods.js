/**
 * Enable additional REST methods
 * On successful completion the browser is redirected to the 'target-url'
 *
 * <a href="url/abc" data-method="delete" data-target-url="/">
 * <a href="url/abc" data-method="delete" data-target-url="/" data-confirm="Are you sure?">
 */
$(function() {

    let addMethods = {
        initialize: function() {
            $( "a[data-method]" ).on('click', this.handleMethod);
        },


        handleMethod: function(e) {
            let link = $(this);
            let httpMethod = link.data('method').toUpperCase();
            let target = link.data('target-url');

            // we expect PUT or DELETE
            if ( $.inArray(httpMethod, ['PUT', 'DELETE']) === - 1 ) {
                return;
            }

            // Allow user to optionally provide data-confirm="Are you sure?"
            if ( link.data('confirm') ) {
                if ( ! addMethods.verifyConfirm(link) ) {
                    return false;
                }
            }

            let address = link.attr('href');
            $.ajax({
                type: httpMethod,
                url: address,
                data: {_method: httpMethod.toLowerCase()},
                success: function (data) {
                    window.location.href = target;
                },
                error: function (data) {
                    console.log('Error:', data);
                }
            });

            e.preventDefault();
        },

        verifyConfirm: function(link) {
            return confirm(link.data('confirm'));
        },

    };

    addMethods.initialize();

});