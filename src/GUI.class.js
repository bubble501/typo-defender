
function Loader(phaserGame, spriteName){
    var _sprite = phaserGame.add.sprite(phaserGame.world.width*0.5, phaserGame.world.height*0.5, spriteName);
    _sprite.anchor.setTo(0.5, 0.5);
    _sprite.scale.set(2);

    var _loading = phaserGame.add.text(phaserGame.world.width*0.5, phaserGame.world.height*0.5 - 96, '...loading...');
    _loading.anchor.set(0.5);
    _loading.fill = '#eee';
    _loading.stroke = '#000';
    _loading.strokeThickness = 6;
    _loading.font = 'VT323';
    _loading.fontSize = 48;

    return{
        update: function() {
            _sprite.angle += 10;
        },
        destroy: function(){
            _sprite.destroy();
            _loading.destroy();
        }
    };
}

function GUIHelper(){}
GUIHelper.formatNumber = function(val){
    var formatted = '';

    var stringValue = val.toString();
    var len = stringValue.length;
    for(var c=len; c>0; c--){
        var pos = (len - c);
        formatted = stringValue[c-1] + (c === len || pos % 3?'':',') + formatted;
    }

    return formatted;
};

function GUI(phaserGame, cannon, enemy, groupLayer){
    var _game = phaserGame;
    var _cannon = cannon;
    var _enemy = enemy;
    var _groupLayer = groupLayer;

    var _currentWordLabel = [];
    var _currentWord = '';

    // bars on the top
    var _uiBar1 = _game.add.tileSprite(0,32, _game.world.width,16, 'ui_bar');
    var _uiBar2 = _game.add.tileSprite(0,64, _game.world.width,16, 'ui_bar');

    // bars behind mobile buttons
    var _uiBar3 = _game.add.tileSprite(0,_game.world.height - 160, 96,16, 'ui_bar');
    var _uiBar4 = _game.add.tileSprite(_game.world.width - 96, _game.world.height - 160, _game.world.width, 16, 'ui_bar');
    var _uiBar5 = _game.add.tileSprite(0,_game.world.height - 192, 96,16, 'ui_bar');
    var _uiBar6 = _game.add.tileSprite(_game.world.width - 96, _game.world.height - 192, _game.world.width, 16, 'ui_bar');

    var _panel = _game.add.image(_game.world.width*0.5,0, 'ui_panel');
    _panel.anchor.set(0.5, -0.1);

    var _healthBg = _game.add.sprite(16,16, 'ui_health');
    _healthBg.scale.set(0.5);

    var _healthBar = _game.add.tileSprite(31, 32, 230, 35, 'health');

    var _healthLabel = _game.add.text(16, 64+16, 'Health');
    _healthLabel.anchor.set(-0.1, 0);
    _healthLabel.fill = '#b00';
    _healthLabel.stroke = '#000';
    _healthLabel.strokeThickness = 6;
    _healthLabel.font = 'VT323';
    _healthLabel.fontSize = 48;

    var _scoreBg = _game.add.sprite(_game.world.width - 16,16, 'ui_health');
    _scoreBg.scale.set(0.5);
    _scoreBg.anchor.set(1, 0);

    var _scoreLabel = _game.add.text(_game.world.width - 128, 18, '0\nScore');
    _scoreLabel.anchor.set(0.25, 0);
    _scoreLabel.fill = '#eee';
    _scoreLabel.stroke = '#000';
    _scoreLabel.strokeThickness = 6;
    _scoreLabel.font = 'VT323';
    _scoreLabel.fontSize = 48;
    _scoreLabel.align = 'right';

    _groupLayer.add(_uiBar1);
    _groupLayer.add(_uiBar2);
    _groupLayer.add(_panel);
    _groupLayer.add(_healthBg);
    _groupLayer.add(_healthBar);
    _groupLayer.add(_healthLabel);
    _groupLayer.add(_scoreBg);
    _groupLayer.add(_scoreLabel);

    var _mobileButtons = [];
    var _mobileButtonsAmount = 2;
    for(var c=0; c<_mobileButtonsAmount; c++){

        // modified to test two buttons only
        var btn = _game.add.sprite((1-c)*192 + c*(_game.world.width - 128 - 64), _game.world.height - 128 - 80, 'mobile_button');
        btn.inputEnabled = true;
        btn.anchor.set(0.5);
        var label = _game.add.text(btn.position.x, btn.position.y, '?');
        label.anchor.set(0.5);
        label.fill = '#eee';
        label.stroke = '#000';
        label.strokeThickness = 6;
        label.font = 'VT323';
        label.fontSize = 128;
        _mobileButtons.push({sprite: btn, label: label});
    }


    var _onButtonDown = function(sprite){
        var hit = _cannon.shoot(sprite.data);

        for(var i=0; i<_mobileButtons.length; i++){
            if(_mobileButtons[i].label.text === sprite.data){
                _mobileButtons[i].sprite.scale.set(0.9);
                _mobileButtons[i].label.scale.set(0.9);
                _mobileButtons[i].label.fill = (hit?'#060':'#600');
            }
        }
    };

    var _onButtonUp = function(sprite){
        for(var i=0; i<_mobileButtons.length; i++){
            _mobileButtons[i].sprite.scale.set(1.0);
            _mobileButtons[i].label.scale.set(1.0);
            _mobileButtons[i].label.fill = '#eee';
        }

        // this is to trick the input
        _cannon.keyUp({key: sprite.data}, true);
    };

    var _shuffleMobileButtons = function(){
        var wordLetters = _enemy.getLetters();

        var remainingLetters = [];
        for(var c=0; c<wordLetters.length; c++){
            if(wordLetters[c].isDestroyed())
                continue;

            remainingLetters.push(wordLetters[c].getLetter());
        }

        var randomLetters = [];
        var isValid = false;

        for(var c=0; c<_mobileButtonsAmount; c++){
            var charCode = parseInt(97 + Math.random()*(122-97));
            var letter = String.fromCharCode(charCode);
            randomLetters.push(letter);

            if(remainingLetters.indexOf(letter) !== -1)
                isValid = true;
        }

        if(!isValid && remainingLetters.length > 0) {
            var injectIndex = parseInt(Math.random() * randomLetters.length);
            var remainingIndex = parseInt(Math.random() * remainingLetters.length);

            randomLetters[injectIndex] = remainingLetters[remainingIndex];
        }

        for(var i=0; i<_mobileButtons.length; i++){
            var char = (remainingLetters.length === 0 ? '?' : randomLetters[i]);
            _mobileButtons[i].label.text = char;
            _mobileButtons[i].sprite.data = char;
            _mobileButtons[i].sprite.events.onInputDown.add(_onButtonDown, this);
            _mobileButtons[i].sprite.events.onInputUp.add(_onButtonUp, this);
        }
    };

    var _onLetterChange = function(letterIndex, destroyed){
        _currentWordLabel[letterIndex].stroke = destroyed?'#060':'#600';
        _currentWordLabel[letterIndex].fill = '#def';

        _scoreLabel.text = GUIHelper.formatNumber(_cannon.getScore())+'\nScore';

        var destroyedFromButtons = false;
        // when loosing a letter, there might be a need to shuffle buttons
        if(!destroyed) {
            for (var i = 0; i < _mobileButtons.length; i++)
                if (_mobileButtons[i].label.text === _currentWordLabel[letterIndex].text)
                    destroyedFromButtons = true;
        }

        if(destroyed || destroyedFromButtons)
            _shuffleMobileButtons();
    };
    _game.onCustomEvent('letter', _onLetterChange);

    var _onHealthChange = function(currentHealth){
        _healthBar.width = currentHealth / 100 * 230;
    };
    _game.onCustomEvent('hit', _onHealthChange);

    var _noobAnimations = function(){
        var cooldownProgress = _enemy.getCooldown();
        if(!cooldownProgress || cooldownProgress <= 0)
            return;

        if(cooldownProgress <= 0.2){
            for(var idx in _currentWordLabel)
                if(_currentWordLabel.hasOwnProperty(idx)) {
                    _currentWordLabel[idx].fill = '#def';
                }
        }
        else if(cooldownProgress <= 0.6){
            for(var idx in _currentWordLabel)
                if(_currentWordLabel.hasOwnProperty(idx))
                    _currentWordLabel[idx].fill = '#111';
        }
        else if(cooldownProgress <= 1.0){
            for(var idx in _currentWordLabel)
                if(_currentWordLabel.hasOwnProperty(idx))
                    _currentWordLabel[idx].fill = '#def';
        }
        else if(cooldownProgress <= 1.4){
            for(var idx in _currentWordLabel)
                if(_currentWordLabel.hasOwnProperty(idx)) {
                    _currentWordLabel[idx].fill = '#111';
                }
        }
    };

    var _update = function(currentWord){

        _noobAnimations();

        if(_currentWord === currentWord)
            return;

        for(var letterIndex in _currentWordLabel) {
            _currentWordLabel[letterIndex].destroy();
        }

        _currentWord = currentWord;
        _currentWordLabel = [];

        for(var letterIndex in _currentWord) {
            var letterObject = _game.add.text(8 + _game.world.width * 0.5 + letterIndex*30 - _currentWord.length*0.5*30, 32, _currentWord[letterIndex].getLetter());
            letterObject.anchor.set(0.5, 0);
            letterObject.fill = '#000';
            letterObject.stroke = '#000';
            letterObject.strokeThickness = 6;
            letterObject.font = 'VT323';
            letterObject.fontSize = 64;
            _currentWordLabel.push(letterObject);
        }

        if(_currentWord.length < 1)
            return;

        _shuffleMobileButtons();
    };

    return {
        update: _update
    };
}
