getTime = ->
	d = new Date()
	"#{d.getHours()}:#{d.getMinutes()}"


exploreCtrl = ($scope, $http) ->

	$scope.communities = []

	req = $http
		method: "GET"
		url: "/community-explore/init"

	req.success (data) ->
		$scope.communities = data

	req.error (err) ->
		console.log err

	$scope.tags = [
			"music",
			"games",
			"art",
			"comedy"
		]

	$scope.selectedTags = []

	$scope.displayTag = (tag) ->
		!(tag in $scope.selectedTags) and tag.indexOf($scope.tagSearch) != -1

	$scope.displayCommunity = (community) ->
		check1 = community.name.indexOf($scope.mainQuery) != -1
		check2 = false
		if $scope.selectedTags.length > 0
			for tag in community.tags
				if tag in $scope.selectedTags
					check2 = true
					break
		else
			check2 = true

		check1 && check2

profileCtrl = ($scope) ->

	$ () ->
		$scope.$apply () ->
			$scope.user = $.parseJSON $(".user-data").html()

	$scope.admin = true