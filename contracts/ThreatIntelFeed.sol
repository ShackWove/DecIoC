// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ThreatIntelFeed{
  struct Indicator{
    uint256 id;
    string name;
    string value;
    string types;
    uint256 confidence;
    address source;
    uint256 first_seen;
    uint256 last_seen;
    string[] tags;
    string description;
  }
  uint256 public counter;
  mapping (uint256 => Indicator) public indicators;
  event IndicatorAdded(uint256 id, string name, string value, string types, uint256 confidence, address source, string[] tags, string description);
  event confidenceUpdated(uint256 id, string name, int256 confidence, address indexed voter);

  function addIndicator(string memory _name, string memory _value, string memory _types, string [] memory _tags, string memory _description) public{
    counter ++;
    indicators[counter] = Indicator(counter, _name, _value, _types, 0, msg.sender, block.timestamp, block.timestamp, _tags, _description);
    emit IndicatorAdded(counter, _name, _value, _types, 0, msg.sender, _tags, _description);
  }

  function incrementConfidence(uint256 id) public{
    require(id > 0 && id <= counter, "invalid indicator ID");
    indicators[id].confidence += 1;
    emit confidenceUpdated(id, string(indicators[id].name), int256(indicators[id].confidence), msg.sender);

  }

  function decrementConfidence(uint256 id) public{
    require(id > 0 && id <= counter, "invalid indicator ID");
    require(indicators[id].confidence > 0, "confidence already 0");
    indicators[id].confidence -= 1;
    emit confidenceUpdated(id, string(indicators[id].name), int256(indicators[id].confidence), msg.sender);

  }

  function getIndicator(uint256 id) public view returns (Indicator memory){
    require(id > 0 && id <= counter, "invalid indicator ID");
    return indicators[id];
  }

  function getIndicators() public view returns (Indicator[] memory){
    Indicator[] memory list = new Indicator[](counter);
    for(uint i =1; i <= counter; i++){
      list[i - 1] = indicators[i];
    }
    return list;
  }


}
