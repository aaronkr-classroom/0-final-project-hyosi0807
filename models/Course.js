// models/Course.js
"use strict";

/**
 * Listing 17.6 (p. 249)
 * 새로운 스키마와 모델의 생성
 */



/**
 * 4-21 캡스터톤 Course 수정
 */
const mongoose = require("mongoose"),
  { Schema } = require("mongoose"),
  courseSchema = new Schema(
    {
      title: {  // 제목(title)과 설명(description) 요청
        type: String,
        required: true,
        unique: true
      },
      description: {
        type: String,
        required: true
      },
      maxStudents: {  // maxStudents와 cost는 초깃값이 0이며 음수가 올 수 없다.
        type: Number,
        default: 0,
        min: [0, "Course cannot have a negative number of students"]
      },
      cost: {
        type: Number,
        default: 0,
        min: [0, "Course cannot have a negative cost"]
      }
    },
    {
      timestamps: true
    }
  );

module.exports = mongoose.model("Course", courseSchema);