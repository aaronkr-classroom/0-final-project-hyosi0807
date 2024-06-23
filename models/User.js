// models/User.js
"use strict";

/**
 * Listing 18.1 (p. 259)
 * user.js에서 사용자 모델 생성
 */

/**
 * passport-local-mongoose를 요청
 */
const passportLocalMongoose = require("passport-local-mongoose")

/**
 * 노트: Mongoose Schema 객체에서 객체 소멸(object destruct)의 사용에 주목하자.
 * {Schema}는 Mongoose의 Schema 객체를 동일한 이름의 상수로 할당한다. 나중에 이
 * 새로운 형식을 다른 모델에 적용할 것이다.
 */
const mongoose = require("mongoose"),
  Subscriber = require("./Subscriber"),
  { Schema } = mongoose,
  userSchema = Schema(
    // 사용자 스키마 생성
    {
      name: {
        // name 속성에 이름(first)과 성(last) 추가
        first: {
          type: String,
          trim: true,
        },
        last: {
          type: String,
          trim: true,
        },
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
      },
      username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        trim: true,
      }, // 비밀번호 속성 추가
      courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // 사용자와 강좌를 연결 시켜주기 위한 강좌 속성 추가
      subscribedAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscriber", // subscribedAccount를 사용자와 구독자를 연결하기 위해 추가
      },
      profileImg: {
        type: String,
        trim: true,
      },
    },
    {
      timestamps: true, // timestamps 속성을 추가해 createdAt 및 updatedAt 시간 기록
    }
  );

/**
 * Listing 18.2 (p. 260)
 * 사용자 모델에 가상 속성 추가
 */
userSchema.virtual("fullName").get(function () {
  return `${this.name.first} ${this.name.last}`;
}); // 사용자의 풀 네임을 얻기 위한 가상 속성 추가

// module.exports = mongoose.model("User", userSchema);

/**
 * 노트: 이 책을 쓰는 시점에 Mongoose 메소드는 더 이상 의존하지 않는 어휘 this를
 * 사용하기 때문에 화살표 함수를 사용할 수 없다.
 */

/**
 * Listing 19.4 (p. 281)
 * user.js에 pre("save") 훅 추가
 */
// pre("save") 훅 설정
userSchema.pre("save", function (next) {
  let user = this; // 콜백에서 함수 키워드 사용
  if (user.subscribedAccount === undefined) {
    // 기존 Subscriber 연결을 위한 조건 체크 추가
    Subscriber.findOne({
      email: user.email,
    }) // Single Subscriber를 위한 퀴리
      .then((subscriber) => {
        user.subscribedAccount = subscriber; // 사용자와 구독자 계정 연결
        next();
      })
      .catch((error) => {
        console.log(`Error in connecting subscriber: ${error.message}`);
        next(error); // 에러 발생 시 다음 미들웨어로 함수로 전달
      });
  } else {
    next(); // 이미 연결 존재 시 다음 미들웨어로 함수 호출
  }
});

/**
 * User 모델에 플러그인으로서 passport-local-mongoose의 추가
 */
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
}); // 사용자 스키마 플러그인으로서 passport-local-mongoose의 추가

module.exports = mongoose.model("User", userSchema);

/**
 * 노트: 이 책을 쓰는 시점에는 Mongoose 훅에서 화살표 함수는 작동하지 않는다.
 */

/**
 * 4-21 캡스톤 User.js 수정
 */
const mongoose = require("mongoose",
  { Schema } = require("mongoose"),
  Subscriber = require("./subscriber"),
  userSchema = new Schema(
    {
      name: {  // first 및 last 속성 추가
        first: {
          type: true
        },
        last: {
          type: String,
          trim: true
        }
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      zipCode: {
        type: Number,
        min: [10000, "Zip code too short"],
        max: 99999
      },  // 패스워드 요청
      password: {
        type: String,
        required: true
      },
      courses: [
        {
          type: Schema.Types.ObjectId,
          ref: "Course"
        }  // 복수의 강좌와 사용자의 연결
      ],
      subscribedAccount: {
        type: Schema.Types.ObjectId,
        ref: "Subscriber"
      }  // 사용자와 구독자의 연결
    },
    {
      timestamps: true  // timestamps 속성 추가
    }
  )
);

module.exports = mongoose.model("User", userSchema);

/**
 * 가상 속성과 pre("save") 훅 추가
 */
userSchema.virtual("fullName").get(function() {  // fullName 가상 속성 추가
  return `${this.name.first} ${this.name.last}`;
});

userSchema.pre("save", function (next) {  // 구독자와의 링크를 위해 pre("save")훅을 추가
  let user = this;
  if (user.subscribedAccount === undefind) {  // 링크된 subscribedAccount 정의 여부 확인
    Subscriber.findOne({
      email: user.email
    })  // 사용자 email을 포함하는 구독자 도큐먼트 검색
      .then(subscriber => {
        user.subscribedAccount = subscriber;
        next();  // 다음 미들웨어 함수 호출
      })
      .catch(error => {
        console.log(`Error in connecting subscriber:
          ${error.message}`);
          next(error);
      });
  } else {
    next();
  }
});