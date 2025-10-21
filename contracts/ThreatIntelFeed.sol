pragma solidity ^0.8.28

contract Threat{
    struct Indicator{
        uint256 id;
        string name;
        string value;
        string type;
        uint256 confidence;
        string source;
        DatetTime first_seen;
        DatetTime last_seen;
        string[] tags;
        string description;
    }
    uint256 public counter
    mapping (uint256 => Indicator) public indicators;
     event IndicatorAdded(uint256 id, string name, string value, string type, string source, string[] tags, string description);

    function addIndicator(string memory _name, string memory _value, string memory _type, string [] _tags, string memory _description) public{
        counter ++:
        indicators[counter] = Indicator(counter, _name, _value, _type, 0, msg.sender, block.timestamp, block.timestamp, _tags, _description);
        emit IndicatorAdded(counter, _name, _value, _type, _source, _tags, _description);
    }

    function modifyIndicator(c)

    function getIndicators() public view returns (Indicator[] memory){
        Indicator[] memory list = new Indicator[](counter);
        for(uint i =1; i <= counter; i++){
            list[i - 1] = indicators[i];
        }
        return list;
    }






}
