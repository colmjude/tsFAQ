;(function($) {
	"use strict";
	var fetched = false,
		ts_faqs = [],
		tw_faqs = [],
		faqtmpl,
		faqtmplsource = [
			'<dl class="faq closed">',
				'<dt>{{title}}</dt>',
				'<dd></dd>',
			'</dl>'
		].join("\n");

	$.getJSON("http://faq.tiddlyspace.com/tiddlers.json?select=tag:FAQ&fat=1&render=1", function(resp) {
		if(resp) {
			_.each(resp, function(item, index, remaining) {
				if( _.contains(item.tags, "TiddlySpace") ) {
					ts_faqs.push( item );
				}
				if( _.contains(item.tags, "TiddlyWiki") ) {
					tw_faqs.push( item );
				}
			});
			fetched = true;
			$.event.trigger("fetched");
		}
	});

	function generateFAQSection(type) {
		var faqList = (type && type === "tiddlywiki") ? tw_faqs : ts_faqs;
		var icon = $("<i></i>").addClass("icon-double-angle-right"),
			header = $("<header></header>").append( $("<h2></h2>", {"text":type, "class": "open"}).append(icon) ),
			section = $("<section></section>")
						.addClass("open")
						.append( header ),
			faqwrap = $("<article></article>").appendTo(section);

		_.each(faqList, function(faq, index, list) {
			var data = {
				title: faq.title
			};

			$( faqtmpl(data) )
				.find("dd")
					.append( faq.render )
					.end()
				.appendTo(faqwrap);

		});
		return section;
	}

	$(function() {
		faqtmpl = Handlebars.compile(faqtmplsource);
		var $main = $("#main");

		function renderBothSets() {
			$main.append(generateFAQSection('tiddlyspace'));
            $main.append(generateFAQSection('tiddlywiki'));
		}

		if(fetched) {
			renderBothSets();
		} else {
			$( document ).bind("fetched", "#main", function() {
				renderBothSets();
			});
		}

		$main.on("click", "dt", function(e) {
			var $this = $(this);
			$this
			    .parent('dl')
			        .toggleClass('closed');
		});

		
	});
}(jQuery));
