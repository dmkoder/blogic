---
title: Simple vehicle controller
description: Đorđe Marković, Bart Bogaerts 
slug: simple-vehicle-controller
date: 2025-10-29 00:00:00+0000
math: true
image: undraw_drone.svg
categories:
    - Application
tags:
    - Dynamic system
    - Temporal logic
    - Verification
---

## Introduction

The purpose of this document is to demonstrate how knowledge representation systems based on first-order logic could be used to solve real-life problems. To do so, we model a simple autonomous vehicle controller that takes care of wind changes and keeps the vehicle on the course. This kind of controller one can usually find in autonomous pilot systems (E.g. drones). The controller we analyze is originally described in the article Boyer, 1990[^1] by Boyer, Green, and Moore. This example is also formalized using the [Imandra system](https://docs.imandra.ai/imandra-docs/notebooks/simple-vehicle-controller/), and this document reproduces the same results in the more lean modeling language. 

[^1]: Boyer, R. S. (1990). The use of a formal simulator to verify a simple real time control program. In Beauty Is Our Business. Springer.

The primary goal of this document is to show how to model a simple autonomous vehicle controller and then prove some major safety properties about it using the good old language of first-order logic. On our way there, we first explain the simple vehicle controller and safety properties about it. After that, we provide a short overview of the <a href="#idp_system">IDP</a> knowledge base system (based on first-order logic). Finally, we explain how this system can be used to prove properties about vehicle controller. We close this discussion with a short conclusion.


### Simple vehicle controller

Here we provide a short explanation of the simple vehicle controller system.
One can imagine that such a controller is in charge of controlling a drone.
In this example controller is taking care of the wind; basically, we want a drone to stay relatively stable in a windy situation without any pilot assistance.
We introduce a few constraints and assumptions in order to make the system easier and feasible for our purposes. 
However, note that imposing these constraints does not affect the generality of our system.

1. We restrict the system to only one space dimension (y-axis). I.e., the drone can move only in one dimension, the other two dimensions are fixed.
2. We abstract over time by seeing the system as a sequence of discreet time points.
3. The vehicle can move with a certain velocity in the positive or negative direction of the y-axis.
4. The wind can blow with a particular speed (in the positive or negative direction of the y-axis).
5. The drone reads the wind speed at each time point.
6. Wind speed cannot change more than one unit between two time points.
7. The controller can change the velocity of the vehicle at any time point for an arbitrary value.

We use following parameters to represent the system:
1. Wind speed - (windSpeed)
2. Vehicle position - (vehiclePosition)
3. Vehicle speed - (vehicleSpeed)
4. Delta wind - (deltaWind or windChange)

When we say that the system is in state (ws,vp,vs) we mean that wind speed = ws, vehicle position = vp, vehicle speed = vs. E.g. (0,0,0) is the state where all three values are zero.


### Controller properties

Modeling a controller is one problem, but verifying its properties is a totally another problem. Usually in this kind of system we want to ensure certain safety properties, hence we want to provide formal proofs that the controller will fulfill them. Before we prove desired properties we have to state them. Here we express some properties that we would like our controller to have:

***Theorem*** [Wind balancing] *If the vehicle starts at the initial state (0,0,0), then the controller guarantees the vehicle never strays farther than three units from the y-axis (I.e. -3 ≤ vehiclePosition ≤ 3).*
  
***Theorem*** [Constant wind] *If the wind ever becomes constant for at least four sampling intervals, then the vehicle returns to the zero point on the y-axis and stays there as long the wind remains constant.*

In general, it is difficult to automatically prove such theorems, and we later transform these theorems into simpler statements by performing certain transformations. The resulting new simpler statements we call invariants. We use this name to indicate that some property is not changing over time (I.e., always holds).

### IDP system

To model this simple dynamic system of the vehicle controller and to prove theorems about it, we are going to use IDP system.

> IDP is a knowledge Base System (KB-system) for the FO(·) language. A Knowledge Base system is a system that supports multiple forms of inferences for the same Knowledge Base. FO(·) is an extension of first-order logic (FO) with types, aggregates, inductive definitions, bounded arithmetic, partial functions, etc.
> — <cite>KU Leuven - DTAI - Knowledge Representation and Reasoning Group website</cite>

For more details you can check the following links:
- [KU Leuven - KRR group](https://krr.gitlab.io/krr-website/)
- [FO(.) Language](https://krr.gitlab.io/krr-website/fodot.html)
- [IDP system](https://krr.gitlab.io/krr-website/idp.html)
- [IDPz3 system (IDP using Z3 solver)](https://www.idp-z3.be/)

Also you can read more in the article (De Cat, 2018)[^2].

[^2]: De Cat, B. a. (2018). Predicate logic as a modeling language: the IDP system. In Declarative Logic Programming: Theory, Systems, and Applications (pp. 273--323).

The main differences between IDP3 and IDPz3 regarding this example are: 
1. IDPz3 supports infinite domains while IDP3 does not.
2. IDP3 provides build-in methods for proving invariants, more on this topic can be found in the article of Bogaerts et al. (Bogaerts, 2014)[^3].
3. The IDPz3 theorem prover supports arithmetics. 

Since none of the systems (at the moment) provides all the features, we will present a (partial) solution in both systems. The plan is to support automated proving of invariants in the new version of IDPz3.

[^3]: Bogaerts, B. a. (2014). Simulating Dynamic Systems Using Linear Time Calculus Theories. Theory and Practice of Logic Programming.


## IDP3 solution

In this section, we first provide the IDP3 linear time calculus theory that formalizes the dynamic system of a simple vehicle controller. Next, we explain how one can use this knowledge base to make interactive simulations, which can be useful to gain some basic idea about controller properties. In the end, we elaborate on how to prove invariants about the simple vehicle controller using this system. 

### Formalizing the Simple Vehicle Controller

In the following specification, we model the simple vehicle controller dynamic system. An IDP model has several components: a vocabulary introducing the domain, a theory expressing domain knowledge, a structure (partially) instantiating the types and relations in the domain, and a procedure initiating some form of inference. As simulating the system and proving invariants about it requires a somewhat different vocabulary and different theories, we split the vocabulary and the theory. The knowledge base is structured as follows:

- **LTC vocabulary** [Simple vehicle controller]:
    1. \(type \text{ } Time\) - A set of natural numbers describing time points.
    2. \(Start : () \rightarrow Time\) - A constant representing the time point when the simulation starts.
    3. \(Next : Time \not\rightarrow Time\) - A function mapping a time point to the next time point. We use \(\not\rightarrow\) to denote that \(Next\) is partial function. This is the case because \(Time\) is a finite subset of natural numbers.
    4. \(windSpeed : Time \rightarrow Int\) - A function mapping time points to the wind speed.
    5. \(vehiclePos : Time \rightarrow Int\) - A function mapping time points to the vehicle position.
    6. \(vehicleSpeed : Time \rightarrow Int\) - A function mapping time points to the vehicle speed.
    7. \(windChange : Time \rightarrow Int\) - A function mapping time points to the wind change.
    8. \(sgn : Int \rightarrow Int\) - A function mapping integers to their sign.
Note that windSpeed, vehiclePos, vehicleSpeed, and windChange are all represented by integers. Type \(Int\) is built-in. 
- **LTC vocabulary** [Good state] (extending vocabulary of Simple vehicle controller):
    - \(GS : Int \times Int\) - Predicate describing a set of reachable states from the state (0,0,0). The first attribute of GS is representing the vehicle position and the second represents the sum of wind and vehicle speed. We need notion of a good state for proving invariants. You can find more about good states in (Boyer, 1990)[^1]. 

- **Theory** [Time]:
    - Time theory symply defines the starting point as the minimum of type Time and the function next to map time points t to time points t+1.
- **Theory** [Simple vehicle controller]:
    - This is the central theory in our example, this is the knowledge we have about the system, and about the controller. Additionally in this theory we specify the sign function.
- **Theory** [Good state]:
    - The good state theory defines the GS predicate by enumerating the set of good states. Note that here we do not discuss how to get these states.

In the following code you can find the sketched knowledge base.

{{< idpgist dmkoder 6c39aa5768a9fb3305745f7f999285f4 3cdfc019eafe9307929355cb5aae547822a9898f
Simple_vehicle_controller-Formalization.idp `Đorđe Marković` `https://idp.cs.kuleuven.be/idp/?example=scienceweek/svc/Simple_vehicle_controller-Formalization` >}}
 


### Simulating the system

Since we have modeled a dynamic temporal system, it can be useful to simulate it interactively. Simulation is quite useful since it provides a way of debugging the system.
While formalizing our system we can use simulation to check whether our system behaves in the way we want. Once we are done with formalization we can use simulation also to explain the behavior of the system to other people. From the other side we can use simulations to test different ideas of controllers while we are searching for a good design.
    
Here we provide a `simulate` method, which takes a theory and a structure as an input.
Basic idea is to take a set of possible actions at the given moment and ask the user to select one of the states to be propagated. Looping over this process is actually a simulation of the dynamic system. In this particular case at each time point there is only one parameter to be selected by the user, and that is wind change.

{{< idpgist dmkoder 6c39aa5768a9fb3305745f7f999285f4 3cdfc019eafe9307929355cb5aae547822a9898f
Simple_vehicle_controller-Simulation.idp `Đorđe Marković` `https://idp.cs.kuleuven.be/idp/?example=scienceweek/svc/Simple_vehicle_controller-Simulation` >}}

For more information about the particular methods of the IDP system please check the (IDP manual, 2020)[^4]. For more details on reasoning in linear time calculus check (Bogaerts, 2014)[^3].

[^4]: KU Leuven Knowledge Representation and Reasoning research group (2020), [The IDP framework reference manual](https://dtai.cs.kuleuven.be/krr/files/bib/manuals/idp3-manual.pdf)



### Proving invariant

The IDP3 system provides an automated way of proving invariants for linear time calculus theories. Here we demonstrate how this automated way of proving invariants can be used on Theorem 1. The system provides two options for proving invariants: (1) using its theorem prover, (2) using model expansion. For both cases, we need to specify initial states to be added to the theory, and the invariant to be proven. For the theorem prover, we do not need a structure, since it will try to prove the invariant generally, i.e., independant of a structure. But for the model expansion approach, we have to provide s structure, since it is a finite model generator, hence we have to limit our types. Once we have all of these, we can simply use the `isinvariant` builtin method.

Here we provide that the initial state is (0,0,0) and we attempt to prove the invariant that says that the system is always in a good state. We also provide structures interpreting the given types.

{{< idpgist dmkoder 6c39aa5768a9fb3305745f7f999285f4 3cdfc019eafe9307929355cb5aae547822a9898f
Simple_vehicle_controller-Theorem-1.idp `Đorđe Marković` `https://idp.cs.kuleuven.be/idp/?example=scienceweek/svc/Simple_vehicle_controller-Theorem-1` >}}

Due to the arithmetics used in the theory, the theorem prover used in IDP3 will fail to prove the invariant of this theory. Unfortunately in this particular case, due to the very large search space, the method based on model expansion will most likely run out of resources and never finish.

The method used to prove the first part of the second theorem is not built-in into IDP3 so we are going to skip this part and go straight to the IDPz3. The idea of proving such theorems would be the same in the IDP3 system, but it does not support infinite domains.
   
        
## IDPz3 solution

Here we provide solutions for verifying properties of the earlier described dynamic system of the simple vehicle controller. Since IDPz3 still does not natively support the `isinvariant` procedure, here we do the transformation manually.


### Theorem 1

As it is explained in the main article, the first theorem is simplified by introducing the notion of a good state \(GS : Int \times Int\). Basically, the theorem is transformed to the statement that the system is always in a good state.
\[\forall t : GS(vehiclePos(t), windSpeed(t) + vehicleSpeed(t))\] 
Here we provide proof by induction over time:

#### Base case

For the base case, we describe the system as it is initially, so we drop all the rules describing transition. Additionally we express the negation of the invariant as a part of the theory. That is because we are basically going to search for a counterexample of the invariant for the base case. The inference method we use is `model_expand` which searches for the models of the theory. If our invariant holds then there is no such model.

Note that we do not need time anymore, since our theory is now only about one single state. So, we replace the functions describing the systems with adequate constants.

{{< idpgist dmkoder 2a1c564c7a3eba07b5b54f2ed3799e9a 38261a83feb3f620a11dbc5946d6e00fb4ed83cf
Simple_vehicle_controller-Theorem_1-Base_case.idpz3 `Đorđe Marković` `https://interactive-consultant.idp-z3.be/IDE?gist=2a1c564c7a3eba07b5b54f2ed3799e9a&file=Simple_vehicle_controller-Theorem_1-Base_case.idpz3` >}}


Obviously, the theory about the base case is unsatisfiable.

#### Induction case

In the induction case, we specify the system in two consecutive time points (we will call them initial and step) with the functional dependencies between them. So, we again introduce constants to describe the system in these two time points, and remove the time. The idea is the same, we try to find a model where our invariant does not hold for the step state with the assumption that it does hold at the initial state. If there is no such model, our invariant holds.


In the induction case we simply prove that whenever the system is in a good state, it will also be in a good state after a step is made.
\[\forall t : GS(vehiclePos(t), windSpeed(t) + vehicleSpeed(t)) \Rightarrow GS(vehiclePos(t+1), windSpeed(t+1) + vehicleSpeed(t+1))\] 

{{< idpgist dmkoder 2a1c564c7a3eba07b5b54f2ed3799e9a 38261a83feb3f620a11dbc5946d6e00fb4ed83cf
Simple_vehicle_controller-Theorem_1-Induction_case.idpz3 `Đorđe Marković` `https://interactive-consultant.idp-z3.be/IDE?gist=2a1c564c7a3eba07b5b54f2ed3799e9a&file=Simple_vehicle_controller-Theorem_1-Induction_case.idpz3` >}}

Here IDPz3 proves that the above theory is unsatisfiable.

### Theorem 2

The second theorem is also simplified using the notion of a good state. First, we prove that the vehicle gets back to the course after four consecutive time points of constant wind. After that, we use the same idea of induction to prove that the vehicle remains there as long as the wind remains constant.


#### Back to the course

First, we define transitions between five consecutive time points (indexed with 0..4). 
Next, we express the assumptions that the system is initially in a good state and that wind never changes. Now we want to prove that, at the last time point, the system is in the good state (0,0). This is a stronger result than we normally need, we just need to prove that the vehicle is at position 0. But we prove the stronger theorem since we will need it later to prove that the vehicle remains at the same position. We use the same idea as before and try to find a counterexample of the described theory (that is why the final result is negated in the theory).
    
{{< idpgist dmkoder 2a1c564c7a3eba07b5b54f2ed3799e9a 38261a83feb3f620a11dbc5946d6e00fb4ed83cf
Simple_vehicle_controller-Theorem_2-Back_to_the_course.idpz3 `Đorđe Marković` `https://interactive-consultant.idp-z3.be/IDE?gist=2a1c564c7a3eba07b5b54f2ed3799e9a&file=Simple_vehicle_controller-Theorem_2-Back_to_the_course.idpz3` >}}

#### Vehicle remains at the course
In order to prove that the vehicle remains at the course as long as the wind is constant, we are going to use induction. Basically, we want to prove that if the system is in a good state (0,0) it will remain at that state as long as the wind does not change. In order to create a single state formula (invariant) that we want to prove we move the if part (when the system is in a good state (0,0)) to the theory. By doing this we obtain the invariant: "system is always in a good state (0,0)". It is trivial that this invariant is initially satisfied so we move directly to the induction case.

{{< idpgist dmkoder 2a1c564c7a3eba07b5b54f2ed3799e9a 38261a83feb3f620a11dbc5946d6e00fb4ed83cf
Simple_vehicle_controller-Theorem_2-Remain_at_the_course.idpz3 `Đorđe Marković` `https://interactive-consultant.idp-z3.be/IDE?gist=2a1c564c7a3eba07b5b54f2ed3799e9a&file=Simple_vehicle_controller-Theorem_2-Remain_at_the_course.idpz3` >}}

## Conclusion

In this short exercise, we show how a simple vehicle controller can be modeled using the IDP system. Furthermore, we demonstrate how to prove some basic safety properties about such a controller. We also demonstrate other possibilities and perks of using this approach (like simulation).

