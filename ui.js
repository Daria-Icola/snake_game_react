'use strict';
const React = require('react');
const { useState, useEffect, useContext } = require('react');
const PropTypes = require('prop-types');
const { Text, Color, Box, StdinContext } = require('ink');
const useInterval = require("./useInterval");
const importJsx = require('import-jsx');
const EndScreen = importJsx("./EndScreen")

// Задаем кнопки клавиатуры для управления
const ARROW_UP = "\u001B[A";
const ARROW_DOWN = "\u001B[B";
const ARROW_LEFT = "\u001B[D";
const ARROW_RIGHT = "\u001B[C";

// Создаем игрвое поле
const FIELD_SIZE =  16;
const FIELD_ROW = [...new Array(FIELD_SIZE).keys()];

// Создаем координата еды
let foodItem = {
	x: Math.floor(Math.random() * FIELD_SIZE),
	y: Math.floor(Math.random() * FIELD_SIZE),
};

// константа хранит все виды направлений которые могут быть.
const DIRECTION = {
	RIGHT: {x: 1, y: 0},
	LEFT: {x: -1, y: 0},
	TOP: {x: 0, y: -1},
	BOTTOM: {x: 0, y: 1}
};
// Функция добавления змейки и фруктов на игровое поле
function getItem (x, y, snakeSegments) {
	if(foodItem.x === x && foodItem.y === y) {
		return <Color red></Color>;
	}

	for (const segment of  snakeSegments){
		if(segment.x === x && segment.y === y ) {
			return <Color green>■</Color>;
		}
	}
}

// Функция ограничения движения змейки
function limitByField(j) {
	if(j >= FIELD_SIZE){
		return 0;
	}
	if(j < 0){
		return FIELD_SIZE - 1;
	}
	return j;
}

// Функция расчета новой позиции для змейки
function newSnakePosition(segments, direction) {
	
	// Получим позицию головы змейки
	const [head] = segments;

	const newHead = {
		x: limitByField(head.x + direction.x),
		y: limitByField(head.y + direction.y)
	};
	if(collidesWithFood(newHead, foodItem)){
		foodItem = {
			x: Math.floor(Math.random() * FIELD_SIZE),
			y: Math.floor(Math.random() * FIELD_SIZE),
		}
		return [newHead, ...segments];
	}

	return [newHead, ...segments.slice(0, -1)];
}

// Функция столкновения с едой
function collidesWithFood(head, foodItem){
	return head.x === foodItem.x && head.y === foodItem.y
}

const App = () => {
	// Змейка
	const [snakeSegments, setSnakeSegments] = useState([
		{x: 8, y: 8},
		{x: 8, y: 7},
		{x: 8, y: 6}
	]);
	// cостояние для игры
	const [direction, setDirection] = useState(DIRECTION.LEFT);
	const { stdin, setRawMode } = useContext(StdinContext);


	// Создаем интерфейс управления змейкой
	useEffect(() => {
		setRawMode(true);
		stdin.on("data", data => {
			const value = data.toString();
			if (value == ARROW_UP) {
				setDirection(DIRECTION.TOP)
			}
			if (value == ARROW_DOWN) {
				setDirection(DIRECTION.BOTTOM)
			}
			if (value == ARROW_LEFT) {
				setDirection(DIRECTION.LEFT)
			}
			if (value == ARROW_RIGHT) {
				setDirection(DIRECTION.RIGHT)
			}
		});
	}, []);

	// Проверка того что змея не пересекаеться сама с собой
	const [head, ...tail] = snakeSegments;

	const intersectsWithItself = tail.some(segment => segment.x === head.x && segment.y === head.y)

	//Тикер интервала
	useInterval(() => {
		setSnakeSegments(segments => newSnakePosition(segments, direction))
	},intersectsWithItself ? null : 50);


	// Игровое поле
	return(
		<Box flexDirection="column" alignItems="center">
			<Text>
			<Color green>Snake</Color> game
			</Text>
			{intersectsWithItself ? (
				<EndScreen size={FIELD_SIZE}/>
			) : (
				<Box flexDirection="column">
					{FIELD_ROW.map(y => (
						<Box key={y}>
							{FIELD_ROW.map(x => (
								<Box key ={x}> { getItem(x, y, snakeSegments) || "." } </Box>
							))}
						</Box>
					))}
				</Box>
			)}
		</Box>
	);

};

App.propTypes = {
	name: PropTypes.string
};

App.defaultProps = {
	name: 'Stranger'
};

module.exports = App;
